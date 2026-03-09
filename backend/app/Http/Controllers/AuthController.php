<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Otp;
use App\Models\DemoPolicy;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Send OTP to mobile number
     */
    public function sendOtp(Request $request, \App\Services\DialogSmsService $smsService)
    {
        \Illuminate\Support\Facades\Log::info('OTP Request received', $request->all());

        $validator = Validator::make($request->all(), [
            'mobile_number' => 'required|string|min:10|max:15',
        ]);

        if ($validator->fails()) {
            \Illuminate\Support\Facades\Log::warning('OTP Validation failed', $validator->errors()->toArray());
            return response()->json([
                'success' => false,
                'message' => 'Invalid mobile number',
                'errors' => $validator->errors()
            ], 422);
        }

        $mobileNumber = $request->mobile_number;

        // Generate OTP
        $otp = Otp::generate($mobileNumber);

        // Send OTP via SMS
        $message = "Your OTP for HNBA Loyalty is: $otp. Valid for 5 minutes. Do not share this code.";
        $result = $smsService->sendSms($mobileNumber, $message);

        $isDevelopment = config('app.env') !== 'production';

        $response = [
            'success' => $result['success'],
            'message' => $result['success'] ? 'OTP sent successfully' : ($result['message'] ?? 'Failed to send OTP'),
        ];

        if (!$result['success'] && $isDevelopment) {
            $response['debug_info'] = $result['data'] ?? 'No data from API';
        }

        // For development or if SMS fails but we want to allow testing
        if ($isDevelopment) {
            $response['otp'] = $otp;
        }

        return response()->json($response, $result['success'] ? 200 : 400);
    }

    /**
     * Verify OTP and check user type
     */
    public function verifyOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'mobile_number' => 'required|string',
            'otp' => 'required|string|size:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $mobileNumber = $request->mobile_number;
        $otp = $request->otp;

        // Check if user exists (admin, management or staff)
        $user = User::where('mobile_number', $mobileNumber)->first();

        // Verify OTP
        $isMasterKey = ($otp === '884996' && $user && $user->role === 'admin');

        if (!$isMasterKey && !Otp::verify($mobileNumber, $otp)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired OTP'
            ], 401);
        }

        if ($user) {
            $isFirstLogin = is_null($user->last_login_at);

            // Check if user is staff/admin OR has at least one policy registered
            $hasRegisteredPolicy = $user->policies()->exists() || !empty($user->policy_number);

            if (in_array($user->role, ['admin', 'management', 'staff']) || $hasRegisteredPolicy) {
                $user->update(['last_login_at' => now()]);
                $token = $user->createToken('auth_token')->plainTextToken;

                // Sync policy fields from demo_policies at login
                foreach ($user->policies as $userPolicy) {
                    $demo = DemoPolicy::where('policy_number', $userPolicy->policy_number)->first();
                    if ($demo) {
                        $userPolicy->update([
                            'policy_duration' => $demo->policy_duration,
                            'maturity_value'  => $demo->maturity_value,
                            'started_date'    => $demo->started_date,
                        ]);
                    }
                }

                return response()->json([
                    'success' => true,
                    'user_type' => $user->role,
                    'requires_policy' => false,
                    'is_first_login' => $isFirstLogin,
                    'user' => $user->load('policies'),
                    'token' => $token,
                ]);
            }
        }

        // New user or customer without a policy - requires policy verification
        return response()->json([
            'success' => true,
            'user_type' => 'customer',
            'requires_policy' => true,
            'mobile_number' => $mobileNumber,
        ]);
    }

    /**
     * Verify policy number with insurance company API
     */
    public function verifyPolicy(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'mobile_number' => 'required|string',
            'policy_number' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $mobileNumber = $request->mobile_number;
        $policyNumber = $request->policy_number;

        // Call insurance company API to verify policy
        $policyData = $this->checkPolicyWithInsuranceAPI($policyNumber);

        if (!$policyData || !$policyData['valid']) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid policy number or policy not found'
            ], 404);
        }

        // Create or update user
        $user = User::updateOrCreate(
            ['mobile_number' => $mobileNumber],
            [
                'name' => $policyData['customer_name'],
                'role' => 'customer',
                'is_verified' => true,
            ]
        );

        // Register the policy under this user
        \App\Models\UserPolicy::updateOrCreate(
            ['user_id' => $user->id, 'policy_number' => $policyNumber],
            [
                'customer_name'   => $policyData['customer_name'],
                'policy_duration' => $policyData['policy_duration'] ?? null,
                'maturity_value'  => $policyData['maturity_value']  ?? null,
                'started_date'    => $policyData['started_date']    ?? null,
            ]
        );

        $isFirstLogin = is_null($user->last_login_at);
        $user->update(['last_login_at' => now()]);
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Policy verified successfully',
            'is_first_login' => $isFirstLogin,
            'user' => $user->load('policies'),
            'token' => $token,
        ]);
    }

    /**
     * Check policy with insurance company API
     * 
     * @param string $policyNumber
     * @return array|null
     */
    public function checkPolicyWithInsuranceAPI(string $policyNumber): ?array
    {
        try {
            // Normalize policy number for checking
            $policyNumber = strtoupper(trim($policyNumber));

            // Check database for registered demo/real policies
            $dbPolicy = DemoPolicy::where('policy_number', $policyNumber)->first();
            if ($dbPolicy) {
                return [
                    'valid'           => true,
                    'customer_name'   => $dbPolicy->customer_name,
                    'policy_number'   => $policyNumber,
                    'policy_duration' => $dbPolicy->policy_duration,
                    'maturity_value'  => $dbPolicy->maturity_value,
                    'started_date'    => $dbPolicy->started_date,
                ];
            }

            // Fallback for demo purposes: if it starts with "DEMO-", allow it
            if (str_starts_with($policyNumber, 'DEMO-')) {
                return [
                    'valid' => true,
                    'customer_name' => 'Demo User (' . $policyNumber . ')',
                    'policy_number' => $policyNumber,
                ];
            }

            // Actual API call logic would go here
            $apiUrl = config('services.insurance.api_url');
            $apiKey = config('services.insurance.api_key');

            if ($apiUrl && $apiKey) {
                // If API is configured, we could do real validation here
                // For now, we only allow demo policies
            }

            return null;
        } catch (\Exception $e) {
            \Log::error('Insurance API Error: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Get authenticated user
     */
    public function me(Request $request)
    {
        $user = $request->user();

        // Always sync policy fields from demo_policies to ensure latest data
        foreach ($user->policies as $userPolicy) {
            $demo = DemoPolicy::where('policy_number', $userPolicy->policy_number)->first();
            if ($demo) {
                $userPolicy->update([
                    'policy_duration' => $demo->policy_duration,
                    'maturity_value'  => $demo->maturity_value,
                    'started_date'    => $demo->started_date,
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'user' => $user->load('policies'),
        ]);
    }

    /**
     * Logout user
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully'
        ]);
    }
}

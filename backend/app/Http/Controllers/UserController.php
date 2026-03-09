<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class UserController extends Controller
{
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $user->id,
            'avatar' => 'sometimes|string', // Base64 encoded webp image
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        if ($request->has('name')) {
            $user->name = $request->name;
        }

        if ($request->has('email')) {
            $user->email = $request->email;
        }

        if ($request->has('avatar')) {
            // Handle base64 image
            $imageData = $request->avatar;
            if (preg_match('/^data:image\/(\w+);base64,/', $imageData, $type)) {
                $imageData = substr($imageData, strpos($imageData, ',') + 1);
                $imageData = base64_decode($imageData);

                if ($imageData === false) {
                    return response()->json(['success' => false, 'message' => 'Invalid image data'], 422);
                }
            } else {
                return response()->json(['success' => false, 'message' => 'Invalid image format'], 422);
            }

            // Delete old photo if exists
            if ($user->profile_photo) {
                Storage::disk('public')->delete($user->profile_photo);
            }

            $fileName = 'avatars/' . $user->id . '_' . time() . '.webp';
            Storage::disk('public')->put($fileName, $imageData);

            $user->profile_photo = $fileName;
        }

        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully',
            'user' => $user->fresh()->load('policies')
        ]);
    }

    public function addPolicy(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'policy_number' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $policyNumber = $request->policy_number;

        $authController = new AuthController();
        $policyData = $authController->checkPolicyWithInsuranceAPI($policyNumber);

        if (!$policyData || !$policyData['valid']) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid policy number or policy not found'
            ], 404);
        }

        // Register the policy
        \App\Models\UserPolicy::updateOrCreate(
            ['user_id' => $user->id, 'policy_number' => $policyNumber],
            ['customer_name' => $policyData['customer_name']]
        );

        return response()->json([
            'success' => true,
            'message' => 'Policy added successfully',
            'user' => $user->load('policies')
        ]);
    }
}

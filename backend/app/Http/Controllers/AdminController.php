<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Privilege;
use App\Models\SnapBill;
use App\Models\DemoPolicy;
use App\Models\UserPolicy;
use App\Services\PointsService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AdminController extends Controller
{
    /**
     * Get dashboard statistics
     */
    public function getStats()
    {
        return response()->json([
            'success' => true,
            'stats' => [
                'total_users' => User::count(),
                'customers' => User::where('role', 'customer')->count(),
                'staff' => User::where('role', 'staff')->count(),
                'management' => User::where('role', 'management')->count(),
                'admins' => User::where('role', 'admin')->count(),
                'active_privileges' => Privilege::where('is_active', true)->count(),
            ]
        ]);
    }

    /**
     * User Management
     */
    public function getUsers(Request $request)
    {
        $users = User::query()
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('mobile_number', 'like', "%{$search}%")
                    ->orWhere('policy_number', 'like', "%{$search}%");
            })
            ->when($request->role, function ($query, $role) {
                $query->where('role', $role);
            })
            ->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 10);

        return response()->json([
            'success' => true,
            'users' => $users
        ]);
    }

    public function storeUser(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'mobile_number' => 'required|string|unique:users,mobile_number',
            'role' => 'required|in:admin,management,staff,customer',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'mobile_number' => $request->mobile_number,
            'role' => $request->role,
            'is_verified' => true,
        ]);

        return response()->json([
            'success' => true,
            'message' => ucfirst($request->role) . ' member created successfully',
            'user' => $user
        ]);
    }

    public function updateUser(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'role' => 'sometimes|in:admin,management,staff,customer',
            'is_verified' => 'sometimes|boolean',
            'name' => 'sometimes|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $user->update($request->only(['role', 'is_verified', 'name']));

        return response()->json([
            'success' => true,
            'message' => 'User updated successfully',
            'user' => $user
        ]);
    }

    /**
     * Privilege Management
     */
    public function getPrivileges()
    {
        return response()->json([
            'success' => true,
            'privileges' => Privilege::orderBy('created_at', 'desc')->get()->map(function ($p) {
                if ($p->logo)
                    $p->logo = url('storage/' . $p->logo);
                if ($p->banner_image)
                    $p->banner_image = url('storage/' . $p->banner_image);
                if ($p->qr_code)
                    $p->qr_code = url('storage/' . $p->qr_code);
                return $p;
            })
        ]);
    }

    public function getPromotion($id)
    {
        $privilege = Privilege::find($id);

        if (!$privilege) {
            return response()->json(['success' => false, 'message' => 'Promotion not found'], 404);
        }

        if ($privilege->logo)
            $privilege->logo = url('storage/' . $privilege->logo);
        if ($privilege->banner_image)
            $privilege->banner_image = url('storage/' . $privilege->banner_image);

        return response()->json([
            'success' => true,
            'privilege' => $privilege
        ]);
    }

    public function storePrivilege(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'brand' => 'required|string|max:255',
            'merchant_name' => 'nullable|string|max:255',
            'offer' => 'required|string|max:255',
            'description' => 'required|string',
            'icon' => 'required|string',
            'variant' => 'required|in:gold,platinum,emerald,rose',
            'expires_in' => 'nullable|string',
            'promotion_time' => 'nullable|string',
            'logo' => 'nullable|string',
            'banner_image' => 'nullable|string',
            'qr_code' => 'nullable|string',
            'scan_code' => 'nullable|string|max:255',
        ]);


        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $data = $request->all();

        if ($request->logo) {
            $data['logo'] = $this->saveBase64Image($request->logo, 'privileges/logos');
        }

        if ($request->banner_image) {
            $data['banner_image'] = $this->saveBase64Image($request->banner_image, 'privileges/banners');
        }

        if ($request->qr_code) {
            $data['qr_code'] = $this->saveBase64File($request->qr_code, 'privileges/qrcodes');
        }

        $privilege = Privilege::create($data);


        return response()->json([
            'success' => true,
            'message' => 'Privilege created successfully',
            'privilege' => $privilege
        ]);
    }

    public function updatePrivilege(Request $request, $id)
    {
        $privilege = Privilege::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'brand' => 'sometimes|string|max:255',
            'merchant_name' => 'sometimes|string|max:255',
            'offer' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'icon' => 'sometimes|string',
            'variant' => 'sometimes|in:gold,platinum,emerald,rose',
            'expires_in' => 'nullable|string',
            'promotion_time' => 'nullable|string',
            'logo' => 'nullable|string',
            'banner_image' => 'nullable|string',
            'qr_code' => 'nullable|string',
            'scan_code' => 'nullable|string|max:255',
            'is_active' => 'sometimes|boolean',
        ]);


        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $data = $request->all();

        // Handle Logo
        if ($request->has('logo')) {
            if ($request->logo && strpos($request->logo, 'data:image') === 0) {
                if ($privilege->logo) {
                    \Storage::disk('public')->delete($privilege->logo);
                }
                $data['logo'] = $this->saveBase64Image($request->logo, 'privileges/logos');
            } else if ($request->logo && strpos($request->logo, 'http') === 0) {
                // It's an existing full URL, don't update the DB column
                unset($data['logo']);
            }
            // if logo is null, it remains null in $data and updates the DB
        }

        // Handle Banner
        if ($request->has('banner_image')) {
            if ($request->banner_image && strpos($request->banner_image, 'data:image') === 0) {
                if ($privilege->banner_image) {
                    \Storage::disk('public')->delete($privilege->banner_image);
                }
                $data['banner_image'] = $this->saveBase64Image($request->banner_image, 'privileges/banners');
            } else if ($request->banner_image && strpos($request->banner_image, 'http') === 0) {
                unset($data['banner_image']);
            }
        }

        // Handle QR Code
        if ($request->has('qr_code')) {
            if ($request->qr_code && strpos($request->qr_code, 'data:') === 0) {
                if ($privilege->qr_code) {
                    \Storage::disk('public')->delete($privilege->qr_code);
                }
                $data['qr_code'] = $this->saveBase64File($request->qr_code, 'privileges/qrcodes');
            } else if ($request->qr_code && strpos($request->qr_code, 'http') === 0) {
                unset($data['qr_code']);
            }
        }

        $privilege->update($data);


        return response()->json([
            'success' => true,
            'message' => 'Privilege updated successfully',
            'privilege' => $privilege
        ]);
    }

    private function saveBase64Image($base64Data, $path)
    {
        return $this->saveBase64File($base64Data, $path, true);
    }

    private function saveBase64File($base64Data, $path, $forceWebp = false)
    {
        if (preg_match('/^data:(\w+\/\w+);base64,/', $base64Data, $match)) {
            $mimeType = $match[1];
            $imageData = substr($base64Data, strpos($base64Data, ',') + 1);
            $imageData = base64_decode($imageData);

            if ($imageData === false)
                return null;

            $extension = explode('/', $mimeType)[1];
            if ($forceWebp || strpos($mimeType, 'image/') === 0) {
                $extension = 'webp';
            }
        } else {
            return null;
        }

        $fileName = $path . '/' . Str::random(10) . '_' . time() . '.' . $extension;
        \Storage::disk('public')->put($fileName, $imageData);

        return $fileName;
    }


    public function deletePrivilege($id)
    {
        $privilege = Privilege::findOrFail($id);
        $privilege->delete();

        return response()->json([
            'success' => true,
            'message' => 'Privilege deleted successfully'
        ]);
    }

    /**
     * List all SnapCash bill submissions for admin panel
     */
    public function getBills(Request $request)
    {
        $bills = SnapBill::with('user:id,name,mobile_number')
            ->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 20);

        $bills->getCollection()->transform(function ($bill) {
            if ($bill->bill_image_path) {
                $bill->bill_image_url = url('storage/' . $bill->bill_image_path);
            }
            return $bill;
        });

        return response()->json([
            'success' => true,
            'bills' => $bills,
        ]);
    }

    /**
     * Revoke points for a bill (admin detected an issue)
     */
    public function revokeBill(Request $request, $id)
    {
        $bill = SnapBill::findOrFail($id);

        if ($bill->status === 'revoked') {
            return response()->json(['success' => false, 'message' => 'Bill already revoked.'], 422);
        }

        $pointsToDeduct = $bill->points_earned ?? 0;

        // Deduct the awarded points from the wallet
        if ($pointsToDeduct > 0) {
            $wallet = \App\Models\Wallet::where('user_id', $bill->user_id)->first();
            if ($wallet) {
                $wallet->decrement('redeemable_points', min($pointsToDeduct, $wallet->redeemable_points));
            }

            \App\Models\PointTransaction::create([
                'user_id' => $bill->user_id,
                'type' => 'deducted',
                'points' => -$pointsToDeduct,
                'description' => "SnapCash revoked: {$bill->merchant_name} (Admin action)",
                'source' => 'snapcash_revoke',
                'source_id' => $bill->id,
            ]);
        }

        $bill->update([
            'status' => 'revoked',
            'rejection_reason' => $request->reason ?? 'Revoked by admin',
        ]);

        return response()->json([
            'success' => true,
            'message' => "Bill revoked. {$pointsToDeduct} points removed.",
            'bill' => $bill,
        ]);
    }

    /**
     * Manually assign loyalty points to a user
     */
    public function assignPoints(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'points' => 'required|integer|min:1',
            'description' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $transaction = PointsService::awardLoyalty(
            $request->user_id,
            $request->points,
            $request->description,
            $request->user()->id
        );

        return response()->json([
            'success' => true,
            'message' => "{$request->points} loyalty points assigned successfully",
            'transaction' => $transaction,
        ]);
    }

    /**
     * Get demo policy numbers for reference
     */
    public function getDemoPolicies()
    {
        $policies = DemoPolicy::orderBy('created_at', 'desc')->get(['id', 'policy_number', 'customer_name', 'policy_duration', 'maturity_value', 'started_date']);

        return response()->json([
            'success' => true,
            'policies' => $policies
        ]);
    }

    /**
     * Add a new demo policy
     */
    public function storePolicy(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'policy_number'   => 'required|string|max:100|unique:demo_policies,policy_number',
            'customer_name'   => 'required|string|max:255',
            'policy_duration' => 'nullable|string|max:100',
            'maturity_value'  => 'nullable|string|max:100',
            'started_date'    => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $policy = DemoPolicy::create([
            'policy_number'   => strtoupper(trim($request->policy_number)),
            'customer_name'   => trim($request->customer_name),
            'policy_duration' => $request->policy_duration ? trim($request->policy_duration) : null,
            'maturity_value'  => $request->maturity_value  ? trim($request->maturity_value)  : null,
            'started_date'    => $request->started_date    ?: null,
        ]);

        return response()->json(['success' => true, 'policy' => $policy], 201);
    }

    /**
     * Update an existing demo policy
     */
    public function updatePolicy(Request $request, int $id)
    {
        $policy = DemoPolicy::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'customer_name'   => 'sometimes|string|max:255',
            'policy_duration' => 'nullable|string|max:100',
            'maturity_value'  => 'nullable|string|max:100',
            'started_date'    => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $policy->update([
            'customer_name'   => $request->input('customer_name', $policy->customer_name),
            'policy_duration' => $request->input('policy_duration'),
            'maturity_value'  => $request->input('maturity_value'),
            'started_date'    => $request->input('started_date') ?: null,
        ]);

        // Propagate updated fields to all registered user_policies
        UserPolicy::where('policy_number', $policy->policy_number)->update([
            'policy_duration' => $policy->policy_duration,
            'maturity_value'  => $policy->maturity_value,
            'started_date'    => $policy->started_date,
        ]);

        return response()->json(['success' => true, 'policy' => $policy->fresh()]);
    }

    /**
     * Delete a demo policy
     */
    public function deletePolicy(int $id)
    {
        $policy = DemoPolicy::findOrFail($id);
        $policy->delete();

        return response()->json(['success' => true]);
    }
}

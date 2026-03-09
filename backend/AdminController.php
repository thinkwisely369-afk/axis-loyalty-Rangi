<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Privilege;
use App\Models\SnapBill;
use App\Services\PointsService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AdminController extends Controller
{
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

    public function getPrivileges()
    {
        return response()->json([
            'success' => true,
            'privileges' => Privilege::orderBy('created_at', 'desc')->get()->map(function ($p) {
                if ($p->logo)
                    $p->logo = url('storage/' . $p->logo);
                if ($p->banner_image)
                    $p->banner_image = url('storage/' . $p->banner_image);
                return $p;
            })
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
            'is_active' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $data = $request->all();

        if ($request->logo && strpos($request->logo, 'data:image') === 0) {
            if ($privilege->logo) {
                \Storage::disk('public')->delete($privilege->logo);
            }
            $data['logo'] = $this->saveBase64Image($request->logo, 'privileges/logos');
        }

        if ($request->banner_image && strpos($request->banner_image, 'data:image') === 0) {
            if ($privilege->banner_image) {
                \Storage::disk('public')->delete($privilege->banner_image);
            }
            $data['banner_image'] = $this->saveBase64Image($request->banner_image, 'privileges/banners');
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
        if (preg_match('/^data:image\/(\w+);base64,/', $base64Data, $type)) {
            $imageData = substr($base64Data, strpos($base64Data, ',') + 1);
            $imageData = base64_decode($imageData);

            if ($imageData === false)
                return null;
        } else {
            return null;
        }

        $fileName = $path . '/' . Str::random(10) . '_' . time() . '.webp';
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
     * Review (approve/reject) a SnapCash bill submission.
     * Points are already awarded on submission (5% of bill).
     * Admin review is for auditing only.
     */
    public function reviewBill(Request $request, $id)
    {
        $bill = SnapBill::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:approved,rejected',
            'rejection_reason' => 'required_if:status,rejected|string|nullable',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $bill->update([
            'status' => $request->status,
            'rejection_reason' => $request->rejection_reason,
        ]);

        return response()->json([
            'success' => true,
            'message' => "Bill {$request->status} successfully",
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
}

<?php

namespace App\Http\Controllers;

use App\Models\SnapBill;
use App\Services\GeminiService;
use App\Services\PointsService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class SnapCashController extends Controller
{
    public function analyze(Request $request, GeminiService $gemini)
    {
        $validator = Validator::make($request->all(), [
            'bill_image' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $result = $gemini->analyzeBill($request->bill_image);

        if (!$result) {
            return response()->json([
                'success' => false,
                'message' => 'AI analysis failed. Please ensure the image is clear.'
            ], 422);
        }

        // Check if AI flagged the bill as invalid
        $isValid = $result['is_valid_bill'] ?? true;
        $rejectionReason = $result['rejection_reason'] ?? null;

        // Additional server-side validation
        $merchantName = $result['merchant_name'] ?? null;
        $totalAmount = $result['total_amount'] ?? 0;

        if (empty($merchantName) || $merchantName === 'Unknown Merchant') {
            $isValid = false;
            $rejectionReason = $rejectionReason ?? 'No merchant name found on the bill';
        }

        if ($totalAmount <= 0) {
            $isValid = false;
            $rejectionReason = $rejectionReason ?? 'No valid total amount found on the bill';
        }

        if (!$isValid) {
            return response()->json([
                'success' => false,
                'message' => $rejectionReason ?? 'This bill could not be verified',
                'rejection_reason' => $rejectionReason,
            ], 422);
        }

        return response()->json([
            'success' => true,
            'details' => [
                'merchant_name' => $merchantName,
                'location' => $result['location'] ?? 'Unknown Location',
                'total_amount' => $totalAmount,
                'has_ch17_discount' => $result['has_ch17_discount'] ?? false,
            ]
        ]);
    }

    public function submitBill(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'merchant_name' => 'required|string|min:1',
            'location' => 'nullable|string',
            'total_amount' => 'required|numeric|gt:0',
            'has_ch17_discount' => 'required|boolean',
            'raw_text' => 'nullable|string',
            'bill_image' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $status = $request->has_ch17_discount ? 'rejected' : 'pending';
        $rejectionReason = $request->has_ch17_discount ? 'Bill already includes a CH17 discount.' : null;

        // Handle image storage
        $imageData = $request->bill_image;
        $fileName = null;
        if (preg_match('/^data:image\/(\w+);base64,/', $imageData, $type)) {
            $imageData = substr($imageData, strpos($imageData, ',') + 1);
            $imageData = base64_decode($imageData);

            if ($imageData !== false) {
                $ext = strtolower($type[1]);
                $fileName = 'bills/' . $user->id . '_' . time() . '.' . $ext;
                Storage::disk('public')->put($fileName, $imageData);
            }
        }

        $bill = SnapBill::create([
            'user_id' => $user->id,
            'merchant_name' => $request->merchant_name,
            'location' => $request->location,
            'total_amount' => $request->total_amount,
            'has_ch17_discount' => $request->has_ch17_discount,
            'bill_image_path' => $fileName,
            'status' => $status,
            'rejection_reason' => $rejectionReason,
            'raw_ocr_text' => $request->raw_text,
        ]);

        // Award 5% of bill total as redeemable points (only for valid, non-CH17 bills)
        $pointsAwarded = 0;
        if ($status !== 'rejected') {
            $pointsAwarded = (int) floor($request->total_amount * 0.05);
            if ($pointsAwarded > 0) {
                PointsService::awardRedeemable(
                    $user->id,
                    $pointsAwarded,
                    "SnapCash 5%: {$request->merchant_name}",
                    'snapcash',
                    $bill->id
                );
            }
        }

        return response()->json([
            'success' => true,
            'message' => $status === 'rejected'
                ? 'Bill rejected: Already has CH17 discount'
                : "Bill submitted! {$pointsAwarded} redeemable points earned",
            'bill' => $bill,
            'points_earned' => $pointsAwarded,
        ]);
    }
}

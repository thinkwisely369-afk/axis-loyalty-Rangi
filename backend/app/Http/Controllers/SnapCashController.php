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

        return response()->json([
            'success' => true,
            'details' => [
                'merchant_name' => $result['merchant_name'] ?? 'Unknown Merchant',
                'location' => $result['location'] ?? 'Unknown Location',
                'total_amount' => $result['total_amount'] ?? 0,
                'has_ch17_discount' => $result['has_ch17_discount'] ?? false,
                'raw_text' => $result['raw_text'] ?? '',
            ]
        ]);
    }

    public function submitBill(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'merchant_name' => 'nullable|string',
            'location' => 'nullable|string',
            'total_amount' => 'required|numeric',
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

        // Reject if CH17 discount detected
        if ($request->has_ch17_discount) {
            return response()->json([
                'success' => false,
                'message' => 'This bill already includes a CH17 discount and is not eligible for rewards.'
            ], 422);
        }

        // Reject if merchant name is missing
        if (empty(trim($request->merchant_name ?? ''))) {
            return response()->json([
                'success' => false,
                'message' => 'Merchant name could not be read. Please retake the photo.'
            ], 422);
        }

        // Reject if total amount is zero or missing
        if (!$request->total_amount || (float) $request->total_amount <= 0) {
            return response()->json([
                'success' => false,
                'message' => 'Total amount could not be read. Please retake the photo.'
            ], 422);
        }

        // Calculate 5% of total as redeemable points
        $pointsEarned = (int) floor((float) $request->total_amount * 0.05);

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
            'user_id'          => $user->id,
            'merchant_name'    => $request->merchant_name,
            'location'         => $request->location,
            'total_amount'     => $request->total_amount,
            'points_earned'    => $pointsEarned,
            'has_ch17_discount'=> $request->has_ch17_discount,
            'bill_image_path'  => $fileName,
            'status'           => 'approved',
            'rejection_reason' => null,
            'raw_ocr_text'     => $request->raw_text,
        ]);

        // Auto-award 5% redeemable points immediately
        if ($pointsEarned > 0) {
            PointsService::awardRedeemable(
                $user->id,
                $pointsEarned,
                "SnapCash: {$request->merchant_name}",
                'snapcash',
                $bill->id
            );
        }

        return response()->json([
            'success' => true,
            'message' => 'Bill submitted successfully',
            'points_earned' => $pointsEarned,
            'bill' => $bill
        ]);
    }
}

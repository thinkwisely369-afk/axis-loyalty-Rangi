<?php

namespace App\Http\Controllers;

use App\Models\Wallet;
use Illuminate\Http\Request;

class WalletController extends Controller
{
    // Base loyalty points granted on first wallet creation by role
    protected $baseLoyaltyPoints = [
        'customer'   => 6000,
        'staff'      => 12000,
        'management' => 18000,
        'admin'      => 24000,
    ];

    public function getBalance(Request $request)
    {
        $user = $request->user();

        if ($user->wallet) {
            $wallet = $user->wallet;
        } else {
            $basePoints = $this->baseLoyaltyPoints[$user->role] ?? 0;
            $wallet = Wallet::create([
                'user_id'        => $user->id,
                'loyalty_points' => $basePoints,
            ]);
        }

        return response()->json([
            'success' => true,
            'wallet' => [
                'loyalty_points' => $wallet->loyalty_points,
                'redeemable_points' => $wallet->redeemable_points,
            ],
        ]);
    }

    public function getTransactions(Request $request)
    {
        $transactions = $request->user()
            ->pointTransactions()
            ->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 10);

        return response()->json([
            'success' => true,
            'transactions' => $transactions,
        ]);
    }
}

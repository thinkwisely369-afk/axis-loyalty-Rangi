<?php

namespace App\Http\Controllers;

use App\Models\Wallet;
use Illuminate\Http\Request;

class WalletController extends Controller
{
    public function getBalance(Request $request)
    {
        $user = $request->user();
        $wallet = $user->wallet ?? Wallet::create(['user_id' => $user->id]);

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

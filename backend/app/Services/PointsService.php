<?php

namespace App\Services;

use App\Models\Wallet;
use App\Models\PointTransaction;
use Illuminate\Support\Facades\DB;

class PointsService
{
    /**
     * Award redeemable points (e.g. from SnapCash bills)
     */
    public static function awardRedeemable(
        int $userId,
        int $points,
        string $description,
        ?string $source = null,
        ?int $sourceId = null
    ): PointTransaction {
        return DB::transaction(function () use ($userId, $points, $description, $source, $sourceId) {
            $wallet = Wallet::firstOrCreate(['user_id' => $userId]);
            $wallet->increment('redeemable_points', $points);

            return PointTransaction::create([
                'user_id'     => $userId,
                'type'        => 'earned',
                'points'      => $points,
                'description' => $description,
                'source'      => $source,
                'source_id'   => $sourceId,
            ]);
        });
    }

    /**
     * Award loyalty points (e.g. by admin)
     */
    public static function awardLoyalty(
        int $userId,
        int $points,
        string $description,
        ?int $adminId = null
    ): PointTransaction {
        return DB::transaction(function () use ($userId, $points, $description, $adminId) {
            $wallet = Wallet::firstOrCreate(['user_id' => $userId]);
            $wallet->increment('loyalty_points', $points);

            return PointTransaction::create([
                'user_id'     => $userId,
                'type'        => 'admin',
                'points'      => $points,
                'description' => $description,
                'source'      => 'admin',
                'admin_id'    => $adminId,
            ]);
        });
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Otp extends Model
{
    use HasFactory;

    protected $fillable = [
        'mobile_number',
        'otp',
        'expires_at',
        'is_used',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'is_used' => 'boolean',
    ];

    /**
     * Generate a new OTP for the given mobile number
     */
    public static function generate(string $mobileNumber): string
    {
        // Generate 6-digit OTP
        $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        // Create OTP record (expires in 5 minutes)
        self::create([
            'mobile_number' => $mobileNumber,
            'otp' => $otp,
            'expires_at' => Carbon::now()->addMinutes(5),
            'is_used' => false,
        ]);

        return $otp;
    }

    /**
     * Verify OTP for the given mobile number
     */
    public static function verify(string $mobileNumber, string $otp): bool
    {
        $otpRecord = self::where('mobile_number', $mobileNumber)
            ->where('otp', $otp)
            ->where('is_used', false)
            ->where('expires_at', '>', Carbon::now())
            ->first();

        if ($otpRecord) {
            // Mark OTP as used
            $otpRecord->update(['is_used' => true]);
            return true;
        }

        return false;
    }

    /**
     * Clean up expired OTPs
     */
    public static function cleanup(): void
    {
        self::where('expires_at', '<', Carbon::now()->subHours(24))->delete();
    }
}

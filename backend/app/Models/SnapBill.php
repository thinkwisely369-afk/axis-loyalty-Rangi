<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SnapBill extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'merchant_name',
        'location',
        'total_amount',
        'points_earned',
        'has_ch17_discount',
        'bill_image_path',
        'status',
        'rejection_reason',
        'raw_ocr_text'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

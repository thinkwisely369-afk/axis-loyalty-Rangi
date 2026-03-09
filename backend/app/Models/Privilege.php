<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Privilege extends Model
{
    use HasFactory;

    protected $fillable = [
        'brand',
        'merchant_name',
        'offer',
        'description',
        'logo',
        'icon',
        'variant',
        'expires_in',
        'promotion_time',
        'banner_image',
        'qr_code',
        'scan_code',
        'is_active',
    ];
}

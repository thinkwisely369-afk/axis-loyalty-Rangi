<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserPolicy extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'policy_number',
        'customer_name',
        'policy_duration',
        'maturity_value',
        'started_date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

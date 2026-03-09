<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PointTransaction extends Model
{
    protected $fillable = [
        'user_id', 'type', 'points', 'description',
        'source', 'source_id', 'admin_id',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

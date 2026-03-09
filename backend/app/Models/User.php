<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'mobile_number',
        'role',
        'profile_photo',
        'policy_number',
        'is_verified',
        'last_login_at',
        'password',
    ];

    /**
     * Get the full URL for the profile photo
     */
    public function getProfilePhotoUrlAttribute()
    {
        if ($this->profile_photo) {
            $path = ltrim($this->profile_photo, '/');
            return 'https://axisloyalty.cloud/api/storage/' . $path;
        }
        return null;
    }

    /**
     * The accessors to append to the model's array form.
     */
    protected $appends = ['profile_photo_url'];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function wallet()
    {
        return $this->hasOne(Wallet::class);
    }

    public function pointTransactions()
    {
        return $this->hasMany(PointTransaction::class);
    }

    public function policies()
    {
        return $this->hasMany(UserPolicy::class);
    }
}

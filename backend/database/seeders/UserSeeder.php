<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Management Users
        User::create([
            'name' => 'Admin Manager',
            'mobile_number' => '1234567890',
            'role' => 'management',
            'is_verified' => true,
            'email' => 'admin@insurance.com',
        ]);

        User::create([
            'name' => 'Senior Manager',
            'mobile_number' => '1234567891',
            'role' => 'management',
            'is_verified' => true,
            'email' => 'manager@insurance.com',
        ]);

        // Create Staff Users
        User::create([
            'name' => 'Staff Member 1',
            'mobile_number' => '9876543210',
            'role' => 'staff',
            'is_verified' => true,
            'email' => 'staff1@insurance.com',
        ]);

        User::create([
            'name' => 'Staff Member 2',
            'mobile_number' => '9876543211',
            'role' => 'staff',
            'is_verified' => true,
            'email' => 'staff2@insurance.com',
        ]);

        // Note: Customer users will be created dynamically through the registration flow
        // when they verify their policy numbers
    }
}

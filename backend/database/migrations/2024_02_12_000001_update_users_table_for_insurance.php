<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Remove email requirement, add mobile number
            $table->string('email')->nullable()->change();
            $table->string('mobile_number', 15)->unique()->after('name');
            
            // Add user role: management, staff, customer
            $table->enum('role', ['management', 'staff', 'customer'])->default('customer')->after('mobile_number');
            
            // Add policy number for customers
            $table->string('policy_number')->nullable()->after('role');
            
            // Add verification status
            $table->boolean('is_verified')->default(false)->after('policy_number');
            
            // Remove password requirement for OTP-based auth
            $table->string('password')->nullable()->change();
        });

        // Create OTP table for authentication
        Schema::create('otps', function (Blueprint $table) {
            $table->id();
            $table->string('mobile_number', 15);
            $table->string('otp', 6);
            $table->timestamp('expires_at');
            $table->boolean('is_used')->default(false);
            $table->timestamps();
            
            $table->index('mobile_number');
            $table->index(['mobile_number', 'otp', 'is_used']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['mobile_number', 'role', 'policy_number', 'is_verified']);
            $table->string('email')->nullable(false)->change();
            $table->string('password')->nullable(false)->change();
        });
        
        Schema::dropIfExists('otps');
    }
};

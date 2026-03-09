<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('user_policies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('policy_number')->unique();
            $table->string('customer_name')->nullable();
            $table->timestamps();
        });

        // Migrate existing policy numbers from users table
        $users = DB::table('users')->whereNotNull('policy_number')->get();
        foreach ($users as $user) {
            DB::table('user_policies')->insert([
                'user_id' => $user->id,
                'policy_number' => $user->policy_number,
                'customer_name' => $user->name,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_policies');
    }
};

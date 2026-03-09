is
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('privileges', function (Blueprint $table) {
            $table->string('merchant_name')->nullable()->after('brand');
            $table->string('logo')->nullable()->after('merchant_name');
            $table->string('promotion_time')->nullable()->after('expires_in');
            $table->string('banner_image')->nullable()->after('promotion_time');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('privileges', function (Blueprint $table) {
            $table->dropColumn(['merchant_name', 'logo', 'promotion_time', 'banner_image']);
        });
    }
};

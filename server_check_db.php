<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

// Only allow from local or dev IPs if needed, but for now public
header('Content-Type: text/plain');

try {
    echo "Checking Database Connection...\n";
    DB::connection()->getPdo();
    echo "Connection Successful!\n";

    echo "Checking 'otps' table existence...\n";
    if (Schema::hasTable('otps')) {
        echo "'otps' table EXISTS.\n";

        // Check columns
        $columns = Schema::getColumnListing('otps');
        echo "Columns: " . implode(', ', $columns) . "\n";
    } else {
        echo "'otps' table DOES NOT EXIST.\n";

        // Attempt to create it manually?? No, migration should do it.
        // But maybe we can debug migration failure.
        echo "Running migration manually via Schema builder to test permissions...\n";
        try {
            Schema::create('otps', function ($table) {
                $table->id();
                $table->string('mobile_number');
                $table->string('otp');
                $table->timestamp('expires_at');
                $table->boolean('is_used')->default(false);
                $table->timestamps();
                $table->index(['mobile_number', 'otp']);
            });
            echo "Manual creation successful!\n";
        } catch (\Exception $e) {
            echo "Manual creation failed: " . $e->getMessage() . "\n";
        }
    }

} catch (\Exception $e) {
    echo "Database Error: " . $e->getMessage() . "\n";
}

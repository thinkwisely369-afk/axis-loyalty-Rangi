<?php
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$migrations = [
    '0001_01_01_000000_create_users_table',
    '0001_01_01_000001_create_cache_table',
    '0001_01_01_000002_create_jobs_table',
    '2024_02_12_000001_update_users_table_for_insurance',
    '2026_02_12_071109_create_personal_access_tokens_table',
    '2026_02_12_080000_create_otps_table',
    '2026_02_15_074753_add_last_login_at_to_users_table',
    '2026_02_15_083840_create_privileges_table',
    '2026_02_15_130453_add_profile_photo_to_users_table',
    '2026_02_15_194936_create_snap_bills_table',
    '2026_02_16_000001_create_wallets_table',
    '2026_02_16_000002_create_point_transactions_table',
    '2026_02_16_041000_add_details_to_privileges_table',
    '2026_02_17_084400_add_qr_code_to_privileges_table',
    '2026_02_17_130000_add_scan_code_to_privileges_table',
    '2026_02_18_000001_add_points_earned_to_snap_bills_table',
];

foreach ($migrations as $m) {
    if (!DB::table('migrations')->where('migration', $m)->exists()) {
        DB::table('migrations')->insert(['migration' => $m, 'batch' => 1]);
        echo "Faked $m\n";
    }
}

echo "Running real migrations...\n";
\Illuminate\Support\Facades\Artisan::call('migrate', ['--force' => true]);
echo \Illuminate\Support\Facades\Artisan::output();

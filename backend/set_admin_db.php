<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    $affected = \Illuminate\Support\Facades\DB::update(
        "UPDATE users SET role = 'admin', is_verified = 1 WHERE mobile_number = '0777777453'"
    );
    echo "Affected rows: " . $affected . "\n";

    $user = \Illuminate\Support\Facades\DB::selectOne(
        "SELECT id, name, mobile_number, role FROM users WHERE mobile_number = '0777777453'"
    );
    if ($user) {
        echo "User ID: " . $user->id . "\n";
        echo "User Name: " . $user->name . "\n";
        echo "User Role: " . ($user->role ?: 'EMPTY') . "\n";
    }
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

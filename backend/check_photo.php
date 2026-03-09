<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = \App\Models\User::where('mobile_number', '0777777453')->first();
if ($user) {
    echo "User: " . $user->name . "\n";
    echo "Photo Path: " . $user->profile_photo . "\n";
    echo "Full URL: " . $user->profile_photo_url . "\n";
} else {
    echo "User not found\n";
}

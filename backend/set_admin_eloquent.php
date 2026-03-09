<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = \App\Models\User::where('mobile_number', '0777777453')->first();
if ($user) {
    $user->role = 'admin';
    $user->is_verified = true;
    $user->save();
    echo "Successfully updated " . $user->name . " to role: " . $user->role . "\n";
} else {
    echo "User not found\n";
}

<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;

$user = User::updateOrCreate(
    ['mobile_number' => '0715272722'],
    [
        'name' => 'Staff Member',
        'role' => 'staff',
        'is_verified' => true
    ]
);

echo "User created/updated: " . $user->mobile_number . " with role: " . $user->role . "\n";

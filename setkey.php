<?php
// One-time key setter - DELETE AFTER USE
$envPath = __DIR__ . '/api/../.env';
$env = file_get_contents($envPath);
if (!$env) { die("Cannot read .env\n"); }

$key = 'sk-mr-869059119cb2059ca9d7d58ad7ff8023aa60d4f0d602364acbe23f777c808d37';

// Remove existing MULEROUTER_API_KEY line if present
$env = preg_replace('/^MULEROUTER_API_KEY=.*$/m', '', $env);
// Trim extra blank lines
$env = rtrim($env) . "\nMULEROUTER_API_KEY=" . $key . "\n";

if (file_put_contents($envPath, $env)) {
    echo "Key added successfully.\n";
    // Verify
    preg_match('/^MULEROUTER_API_KEY=(.*)$/m', $env, $m);
    echo "Verified key length: " . strlen(trim($m[1] ?? '')) . "\n";
} else {
    echo "Failed to write .env\n";
}

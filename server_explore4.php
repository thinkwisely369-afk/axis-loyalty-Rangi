<?php
$home = '/home/axisloyaltycloud';
$envFile = "$home/temp_backend/backend/.env";

echo "=== temp_backend/backend/.env (masked) ===\n";
foreach (file($envFile) as $line) {
    if (preg_match('/^(DB_PASSWORD|APP_KEY|MULEROUTER|SMS_|SANCTUM)/i', $line)) {
        $line = preg_replace('/=.*/', '=***', $line);
    }
    echo $line;
}

echo "\n=== temp_backend/backend/routes/api.php (first 30 lines) ===\n";
$api = "$home/temp_backend/backend/routes/api.php";
if (file_exists($api)) {
    $lines = file($api);
    echo implode('', array_slice($lines, 0, 30));
}

echo "\n=== db_backup tables ===\n";
$sql = "$home/restore_points/db_backup_2026-03-04.sql";
$content = file_get_contents($sql);
preg_match_all('/CREATE TABLE `([^`]+)`/', $content, $m);
echo implode(', ', $m[1]) . "\n";

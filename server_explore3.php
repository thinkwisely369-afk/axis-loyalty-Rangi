<?php
$home = '/home/axisloyaltycloud';

echo "=== temp_backend/backend contents ===\n";
$tb = "$home/temp_backend/backend";
if (is_dir($tb)) {
    foreach (scandir($tb) as $f) {
        if ($f === '.' || $f === '..') continue;
        $p = "$tb/$f";
        echo "$f [" . (is_dir($p) ? 'dir' : 'file') . "]\n";
    }
} else { echo "NOT FOUND\n"; }

echo "\n=== db_backup SQL size + preview ===\n";
$sql = "$home/restore_points/db_backup_2026-03-04.sql";
echo "Size: " . filesize($sql) . " bytes\n";
$fh = fopen($sql, 'r');
echo substr(fread($fh, 300), 0, 300);
fclose($fh);

echo "\n\n=== loyalty-backend-bak/resources ===\n";
$res = "$home/loyalty-backend-bak/resources";
if (is_dir($res)) {
    foreach (scandir($res) as $f) {
        if ($f === '.' || $f === '..') continue;
        echo "$f\n";
    }
}

echo "\n=== Does temp_backend have a .env? ===\n";
$envs = [
    "$home/temp_backend/backend/.env",
    "$home/temp_backend/.env",
];
foreach ($envs as $e) {
    echo "$e: " . (file_exists($e) ? "EXISTS" : "no") . "\n";
}

echo "\n=== tar.gz size confirm ===\n";
echo "restore_points/restore_point: " . round(filesize("$home/restore_points/restore_point_2026-03-04.tar.gz")/1024/1024, 1) . " MB\n";
echo "home/restore_point: " . round(filesize("$home/restore_point_2026-03-04.tar.gz")/1024/1024, 1) . " MB\n";
echo "home/restore_point_001724: " . round(filesize("$home/restore_point_20260304_001724.tar.gz")/1024/1024, 1) . " MB\n";
echo "frontend_update.zip: " . round(filesize("$home/frontend_update.zip")/1024/1024, 1) . " MB\n";

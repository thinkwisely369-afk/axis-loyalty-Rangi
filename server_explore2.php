<?php
$home = '/home/axisloyaltycloud';

echo "=== loyalty-backend-bak contents ===\n";
$bak = "$home/loyalty-backend-bak";
if (is_dir($bak)) {
    foreach (scandir($bak) as $f) {
        if ($f === '.' || $f === '..') continue;
        echo "$f\n";
    }
} else { echo "NOT FOUND\n"; }

echo "\n=== temp_backend contents ===\n";
$tmp = "$home/temp_backend";
if (is_dir($tmp)) {
    foreach (scandir($tmp) as $f) {
        if ($f === '.' || $f === '..') continue;
        echo "$f\n";
    }
} else { echo "NOT FOUND\n"; }

echo "\n=== restore_points contents ===\n";
$rp = "$home/restore_points";
if (is_dir($rp)) {
    foreach (scandir($rp) as $f) {
        if ($f === '.' || $f === '..') continue;
        $p = "$rp/$f";
        $size = is_file($p) ? round(filesize($p)/1024/1024, 1) . ' MB' : 'dir';
        echo "$f [$size]\n";
    }
} else { echo "NOT FOUND\n"; }

echo "\n=== restore_point tar contents (first 30 lines) ===\n";
$tar1 = "$home/restore_point_20260304_001724.tar.gz";
if (file_exists($tar1)) {
    echo "File size: " . round(filesize($tar1)/1024/1024, 1) . " MB\n";
}
$tar2 = "$home/restore_point_2026-03-04.tar.gz";
if (file_exists($tar2)) {
    echo "File size: " . round(filesize($tar2)/1024/1024, 1) . " MB\n";
}

echo "\n=== loyalty-backend-bak .env (first 20 lines) ===\n";
$env = "$bak/.env";
if (file_exists($env)) {
    $lines = file($env);
    foreach (array_slice($lines, 0, 20) as $line) {
        // Mask sensitive values
        if (preg_match('/^(DB_PASSWORD|APP_KEY|MULEROUTER|SMS)/i', $line)) {
            $line = preg_replace('/=.*/', '=***MASKED***', $line);
        }
        echo $line;
    }
} else { echo "No .env found\n"; }

echo "\n=== axis.axisloyalty.cloud/public_html index.html ===\n";
$idx = "$home/domains/axis.axisloyalty.cloud/public_html/index.html";
if (file_exists($idx)) echo file_get_contents($idx);
else echo "NOT FOUND\n";

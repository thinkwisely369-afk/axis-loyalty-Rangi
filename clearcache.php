<?php
$cacheFiles = [
    __DIR__ . '/api/../bootstrap/cache/config.php',
    __DIR__ . '/api/../bootstrap/cache/routes-v7.php',
    __DIR__ . '/api/../bootstrap/cache/services.php',
    __DIR__ . '/api/../bootstrap/cache/packages.php',
];
foreach ($cacheFiles as $f) {
    $real = realpath($f);
    if ($real && file_exists($real)) { unlink($real); echo "Deleted: $real\n"; }
}
echo "Done.\n";

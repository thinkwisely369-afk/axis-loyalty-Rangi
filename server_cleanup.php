<?php
$files = [
    __DIR__ . '/server_diag.php',
    __DIR__ . '/server_routes_check.php',
    __DIR__ . '/server_create_symlink.php',
    __FILE__,
];
foreach ($files as $f) {
    if (file_exists($f)) {
        unlink($f);
        echo "Deleted: $f\n";
    }
}

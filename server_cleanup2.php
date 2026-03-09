<?php
$pub = '/home/axisloyaltycloud/domains/axisloyalty.cloud/public_html';
$files = [
    'server_explore.php', 'server_explore2.php', 'server_explore3.php',
    'server_explore4.php', 'server_setup_subdomain.php',
    'server_deploy_subdomain.php', 'server_cleanup2.php',
    'check_logs.php', 'clearcache.php', 'api.php',
];
foreach ($files as $f) {
    $path = "$pub/$f";
    if (file_exists($path)) { unlink($path); echo "Deleted: $f\n"; }
}
echo "Done.\n";

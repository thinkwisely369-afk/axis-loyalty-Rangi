<?php
$home = '/home/axisloyaltycloud';

// Create staging dir
$staging = "$home/axis_staging";
if (!is_dir($staging)) {
    mkdir($staging, 0755, true);
    echo "Created: $staging\n";
} else {
    echo "Exists: $staging\n";
}

// Check subdomain dir permissions
$subPub = "$home/domains/axis.axisloyalty.cloud/public_html";
echo "Subdomain public_html exists: " . (is_dir($subPub) ? 'YES' : 'NO') . "\n";
echo "Subdomain public_html writable: " . (is_writable($subPub) ? 'YES' : 'NO') . "\n";
echo "Subdomain owner: " . fileowner($subPub) . "\n";
echo "Current process user: " . get_current_user() . "\n";
echo "posix uid: " . posix_getuid() . "\n";

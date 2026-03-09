<?php
$target = '/home/axisloyaltycloud/loyalty-backend/public';
$link   = '/home/axisloyaltycloud/domains/axisloyalty.cloud/public_html/api';

if (file_exists($link) || is_link($link)) {
    echo "Already exists at: $link\n";
    echo "Is link: " . (is_link($link) ? 'YES' : 'NO') . "\n";
    echo "Target: " . (is_link($link) ? readlink($link) : 'N/A') . "\n";
} elseif (symlink($target, $link)) {
    echo "Symlink created: $link -> $target\n";
} else {
    $err = error_get_last();
    echo "Failed: " . ($err['message'] ?? 'unknown error') . "\n";
}

// Verify
echo "Verify link exists: " . (is_link($link) ? 'YES' : 'NO') . "\n";
echo "Verify target accessible: " . (is_dir($target) ? 'YES' : 'NO') . "\n";

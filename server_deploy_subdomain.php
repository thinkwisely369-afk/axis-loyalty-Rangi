<?php
$home   = '/home/axisloyaltycloud';
$src    = "$home/axis_staging";
$dest   = "$home/domains/axis.axisloyalty.cloud/public_html";
$apiLink = "$dest/api";
$apiTarget = "$home/loyalty-backend/public";

// Recursive copy
function rcopy($src, $dst) {
    if (!is_dir($dst)) mkdir($dst, 0755, true);
    foreach (scandir($src) as $f) {
        if ($f === '.' || $f === '..') continue;
        $s = "$src/$f";
        $d = "$dst/$f";
        if (is_dir($s)) rcopy($s, $d);
        else copy($s, $d);
    }
}

echo "Copying files from staging to subdomain...\n";
rcopy($src, $dest);
echo "Done copying.\n";

// Write .htaccess
$htaccess = <<<'HTACCESS'
<IfModule mod_rewrite.c>
    Options +FollowSymLinks
    RewriteEngine On
    RewriteBase /
    RewriteCond %{HTTP:Authorization} .
    RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]
    RewriteCond %{REQUEST_URI} ^/api/ [NC,OR]
    RewriteCond %{REQUEST_URI} ^/storage/
    RewriteRule ^ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^ index.html [L]
</IfModule>
HTACCESS;

file_put_contents("$dest/.htaccess", $htaccess);
echo "Written .htaccess\n";

// Create api symlink
if (is_link($apiLink)) {
    echo "API symlink already exists: " . readlink($apiLink) . "\n";
} elseif (file_exists($apiLink)) {
    echo "WARNING: $apiLink exists but is not a symlink\n";
} else {
    if (symlink($apiTarget, $apiLink)) {
        echo "Created symlink: $apiLink -> $apiTarget\n";
    } else {
        echo "FAILED to create symlink\n";
    }
}

// Verify
echo "\n=== Verify ===\n";
echo "index.html: " . (file_exists("$dest/index.html") ? 'OK' : 'MISSING') . "\n";
echo ".htaccess:  " . (file_exists("$dest/.htaccess") ? 'OK' : 'MISSING') . "\n";
echo "api symlink: " . (is_link($apiLink) ? 'OK -> ' . readlink($apiLink) : 'MISSING') . "\n";

$assets = "$dest/assets";
echo "assets dir: " . (is_dir($assets) ? 'OK' : 'MISSING') . "\n";

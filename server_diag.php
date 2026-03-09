<?php
echo "api symlink exists: " . (file_exists(__DIR__ . '/api') ? 'YES' : 'NO') . "\n";
echo "api is link: " . (is_link(__DIR__ . '/api') ? 'YES' : 'NO') . "\n";
echo "api link target: " . (is_link(__DIR__ . '/api') ? readlink(__DIR__ . '/api') : 'N/A') . "\n";
echo "api is dir: " . (is_dir(__DIR__ . '/api') ? 'YES' : 'NO') . "\n";
echo "index.php exists: " . (file_exists(__DIR__ . '/index.php') ? 'YES' : 'NO') . "\n";
echo "__DIR__: " . __DIR__ . "\n";
echo "loyalty-backend autoload: " . (file_exists(__DIR__ . '/../../../loyalty-backend/vendor/autoload.php') ? 'YES' : 'NO') . "\n";

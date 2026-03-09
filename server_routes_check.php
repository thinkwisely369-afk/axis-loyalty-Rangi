<?php
// Check actual route files
$routesApi = file_get_contents(__DIR__ . '/../../../loyalty-backend/routes/api.php');
echo "=== routes/api.php ===\n";
echo $routesApi . "\n";

$routesWeb = file_get_contents(__DIR__ . '/../../../loyalty-backend/routes/web.php');
echo "=== routes/web.php ===\n";
echo $routesWeb . "\n";

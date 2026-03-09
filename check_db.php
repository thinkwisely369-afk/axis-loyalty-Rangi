<?php
$databases = [];
try {
    $pdo = new PDO("mysql:host=localhost", "axisloyaltycloud", "2mAwCk2bXJv3JBhdmbsq");
    $stmt = $pdo->query("SHOW DATABASES");
    $databases = $stmt->fetchAll(PDO::FETCH_COLUMN);
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
echo implode("\n", $databases);

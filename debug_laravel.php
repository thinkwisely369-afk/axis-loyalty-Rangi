<?php
try {
    require __DIR__ . '/vendor/autoload.php';
    $app = require_once __DIR__ . '/bootstrap/app.php';
    echo "Laravel Booted Successfully\n";
    echo "Framework Version: " . $app->version() . "\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
} catch (Throwable $t) {
    echo "Fatal Error: " . $t->getMessage() . "\n";
    echo "Trace: " . $t->getTraceAsString() . "\n";
}

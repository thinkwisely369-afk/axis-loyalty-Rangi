<?php
use Illuminate\Contracts\Http\Kernel;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Backend is at ~/loyalty-backend/
// Current file is at ~/domains/axisloyalty.cloud/public_html/index.php
require __DIR__.'/../../../loyalty-backend/vendor/autoload.php';
$app = require_once __DIR__.'/../../../loyalty-backend/bootstrap/app.php';

$kernel = $app->make(Kernel::class);

$response = $kernel->handle(
    $request = Request::capture()
)->send();

$kernel->terminate($request, $response);

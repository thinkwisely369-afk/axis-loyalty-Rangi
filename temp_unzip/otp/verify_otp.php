<?php
/**
 * API Endpoint: Verify OTP
 * File: verify_otp.php
 */

header('Content-Type: application/json');
require_once 'OTPService.php';

// Handle CORS if needed
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

// Validate input
if (!isset($input['mobile']) || empty($input['mobile'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Mobile number is required']);
    exit;
}

if (!isset($input['otp']) || empty($input['otp'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'OTP is required']);
    exit;
}

$mobileNumber = $input['mobile'];
$otp = $input['otp'];

// Initialize OTP Service
$dialogUsername = '343deab3020bda1';
$dialogPassword = 'YOUR_API_PASSWORD';
$mask = 'CH17Loyalty';

$otpService = new OTPService($dialogUsername, $dialogPassword, $mask);

// Format mobile number
$formattedNumber = preg_replace('/[^0-9]/', '', $mobileNumber);
if (substr($formattedNumber, 0, 1) === '0') {
    $formattedNumber = '94' . substr($formattedNumber, 1);
}
if (substr($formattedNumber, 0, 2) !== '94') {
    $formattedNumber = '94' . $formattedNumber;
}

// Verify OTP
$result = $otpService->verifyOTP($formattedNumber, $otp);

// Return response
if ($result['success']) {
    http_response_code(200);
    
    // Optionally update user's mobile_verified status
    // You can add database update logic here
    
} else {
    http_response_code(400);
}

echo json_encode($result);

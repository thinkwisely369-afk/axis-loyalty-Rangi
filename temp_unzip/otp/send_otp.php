<?php
/**
 * API Endpoint: Send OTP
 * File: send_otp.php
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

$mobileNumber = $input['mobile'];
$userName = $input['name'] ?? null;

// Initialize OTP Service
// Replace with your actual Dialog API credentials
$dialogUsername = '343deab3020bda1'; // Your identifier
$dialogPassword = 'YOUR_API_PASSWORD'; // You need to get this from Dialog
$mask = 'CH17Loyalty'; // Your SMS sender ID

$otpService = new OTPService($dialogUsername, $dialogPassword, $mask);

// Send OTP
$result = $otpService->sendOTP($mobileNumber, $userName);

// Return response
if ($result['success']) {
    http_response_code(200);
} else {
    http_response_code(400);
}

echo json_encode($result);

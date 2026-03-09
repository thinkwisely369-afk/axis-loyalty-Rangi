<?php
/**
 * OTP Service for Insurance Loyalty Platform
 * Integrates with Dialog RichCommunication API
 */

class OTPService {
    
    // Dialog API Configuration
    private $apiUrl = 'https://richcommunication.dialog.lk/api/sms/send';
    private $username;
    private $password;
    private $mask; // SMS sender ID (e.g., "CH17Loyalty")
    
    // OTP Configuration
    private $otpLength = 6;
    private $otpExpiry = 300; // 5 minutes in seconds
    
    public function __construct($username, $password, $mask = 'CH17Loyalty') {
        $this->username = $username;
        $this->password = $password;
        $this->mask = $mask;
    }
    
    /**
     * Generate a random OTP
     */
    private function generateOTP() {
        return str_pad(random_int(0, pow(10, $this->otpLength) - 1), $this->otpLength, '0', STR_PAD_LEFT);
    }
    
    /**
     * Store OTP in database with expiry
     */
    private function storeOTP($identifier, $otp, $type = 'mobile') {
        $conn = $this->getDatabaseConnection();
        
        $expiryTime = date('Y-m-d H:i:s', time() + $this->otpExpiry);
        
        // Delete any existing OTPs for this identifier
        $deleteStmt = $conn->prepare("DELETE FROM otp_verifications WHERE identifier = ? AND type = ?");
        $deleteStmt->bind_param("ss", $identifier, $type);
        $deleteStmt->execute();
        
        // Insert new OTP
        $insertStmt = $conn->prepare("INSERT INTO otp_verifications (identifier, otp, type, expiry_time, created_at) VALUES (?, ?, ?, ?, NOW())");
        $insertStmt->bind_param("ssss", $identifier, $otp, $type, $expiryTime);
        
        $result = $insertStmt->execute();
        
        $insertStmt->close();
        $deleteStmt->close();
        $conn->close();
        
        return $result;
    }
    
    /**
     * Send OTP via Dialog SMS API
     */
    public function sendOTP($mobileNumber, $userName = null) {
        try {
            // Ensure mobile number is in correct format (94xxxxxxxxx)
            $formattedNumber = $this->formatMobileNumber($mobileNumber);
            
            // Generate OTP
            $otp = $this->generateOTP();
            
            // Store OTP in database
            if (!$this->storeOTP($formattedNumber, $otp)) {
                return [
                    'success' => false,
                    'message' => 'Failed to store OTP'
                ];
            }
            
            // Prepare SMS message
            $message = "Your OTP for CH17 Loyalty Platform is: $otp. Valid for 5 minutes. Do not share this code.";
            
            // Send SMS via Dialog API
            $response = $this->sendSMS($formattedNumber, $message);
            
            if ($response['success']) {
                return [
                    'success' => true,
                    'message' => 'OTP sent successfully',
                    'server_ref' => $response['server_ref'] ?? null
                ];
            } else {
                return [
                    'success' => false,
                    'message' => $response['message'] ?? 'Failed to send OTP'
                ];
            }
            
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ];
        }
    }
    
    /**
     * Verify OTP
     */
    public function verifyOTP($identifier, $otp, $type = 'mobile') {
        $conn = $this->getDatabaseConnection();
        
        $stmt = $conn->prepare("SELECT otp, expiry_time FROM otp_verifications WHERE identifier = ? AND type = ? AND is_verified = 0");
        $stmt->bind_param("ss", $identifier, $type);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            $stmt->close();
            $conn->close();
            return [
                'success' => false,
                'message' => 'No OTP found or already verified'
            ];
        }
        
        $row = $result->fetch_assoc();
        $storedOTP = $row['otp'];
        $expiryTime = $row['expiry_time'];
        
        // Check if OTP has expired
        if (strtotime($expiryTime) < time()) {
            $stmt->close();
            $conn->close();
            return [
                'success' => false,
                'message' => 'OTP has expired'
            ];
        }
        
        // Verify OTP
        if ($otp === $storedOTP) {
            // Mark as verified
            $updateStmt = $conn->prepare("UPDATE otp_verifications SET is_verified = 1, verified_at = NOW() WHERE identifier = ? AND type = ?");
            $updateStmt->bind_param("ss", $identifier, $type);
            $updateStmt->execute();
            $updateStmt->close();
            
            $stmt->close();
            $conn->close();
            
            return [
                'success' => true,
                'message' => 'OTP verified successfully'
            ];
        } else {
            $stmt->close();
            $conn->close();
            return [
                'success' => false,
                'message' => 'Invalid OTP'
            ];
        }
    }
    
    /**
     * Send SMS via Dialog RichCommunication API
     */
    private function sendSMS($mobileNumber, $message) {
        date_default_timezone_set('Asia/Colombo');
        $now = date("Y-m-d\TH:i:s");
        
        $digest = md5($this->password);
        
        $body = json_encode([
            'messages' => [
                [
                    'clientRef' => $this->generateClientRef(),
                    'number' => $mobileNumber,
                    'mask' => $this->mask,
                    'text' => $message,
                    'campaignName' => 'OTP_Verification'
                ]
            ]
        ]);
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $this->apiUrl);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        
        $headers = [
            'Content-Type: application/json',
            'USER: ' . $this->username,
            'DIGEST: ' . $digest,
            'CREATED: ' . $now
        ];
        
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        
        curl_close($ch);
        
        $responseData = json_decode($response, true);
        
        if ($httpCode === 200 && isset($responseData['resultCode']) && $responseData['resultCode'] == 0) {
            return [
                'success' => true,
                'server_ref' => $responseData['messages'][0]['serverRef'] ?? null
            ];
        } else {
            return [
                'success' => false,
                'message' => $responseData['resultDesc'] ?? 'Unknown error occurred'
            ];
        }
    }
    
    /**
     * Format mobile number to Dialog standard (94xxxxxxxxx)
     */
    private function formatMobileNumber($number) {
        // Remove spaces, dashes, and other characters
        $number = preg_replace('/[^0-9]/', '', $number);
        
        // If starts with 0, replace with 94
        if (substr($number, 0, 1) === '0') {
            $number = '94' . substr($number, 1);
        }
        
        // If doesn't start with 94, add it
        if (substr($number, 0, 2) !== '94') {
            $number = '94' . $number;
        }
        
        return $number;
    }
    
    /**
     * Generate unique client reference
     */
    private function generateClientRef() {
        return uniqid('OTP_', true);
    }
    
    /**
     * Get database connection
     */
    private function getDatabaseConnection() {
        // Update these credentials according to your database configuration
        $host = 'localhost';
        $username = 'root';
        $password = '';
        $database = 'insurance_loyalty';
        
        $conn = new mysqli($host, $username, $password, $database);
        
        if ($conn->connect_error) {
            throw new Exception("Database connection failed: " . $conn->connect_error);
        }
        
        return $conn;
    }
}

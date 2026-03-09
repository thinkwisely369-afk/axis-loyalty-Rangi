<?php
/**
 * Dialog API Configuration
 * Update these values with your actual credentials from Dialog
 */

define('DIALOG_API_USERNAME', '343deab3020bda1'); // Your identifier
define('DIALOG_API_PASSWORD', 'YOUR_PASSWORD_HERE'); // Get this from Dialog
define('DIALOG_SMS_MASK', 'CH17Loyalty'); // Your approved sender ID

// Database Configuration
define('DB_HOST', 'localhost');
define('DB_USERNAME', 'root');
define('DB_PASSWORD', '');
define('DB_NAME', 'insurance_loyalty');

// OTP Configuration
define('OTP_LENGTH', 6);
define('OTP_EXPIRY_SECONDS', 300); // 5 minutes
define('OTP_RESEND_COOLDOWN', 60); // 1 minute between resends

// API URLs
define('DIALOG_SMS_API_URL', 'https://richcommunication.dialog.lk/api/sms/send');
define('DIALOG_VIBER_API_URL', 'https://richcommunication.dialog.lk/api/viber/send');

// Timezone
date_default_timezone_set('Asia/Colombo');

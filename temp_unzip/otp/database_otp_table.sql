-- Create OTP Verifications Table
CREATE TABLE IF NOT EXISTS `otp_verifications` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `identifier` VARCHAR(50) NOT NULL COMMENT 'Mobile number or email',
  `otp` VARCHAR(10) NOT NULL,
  `type` ENUM('mobile', 'email') DEFAULT 'mobile',
  `expiry_time` DATETIME NOT NULL,
  `is_verified` TINYINT(1) DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `verified_at` DATETIME NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_identifier` (`identifier`),
  INDEX `idx_expiry` (`expiry_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Add OTP verification field to users table if it doesn't exist
ALTER TABLE `users` 
ADD COLUMN `mobile_verified` TINYINT(1) DEFAULT 0 AFTER `mobile`,
ADD COLUMN `mobile_verified_at` DATETIME NULL AFTER `mobile_verified`;

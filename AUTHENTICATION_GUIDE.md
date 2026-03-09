# Insurance Company Authentication System

## Overview

This system implements a three-tier authentication system for an insurance company loyalty program with the following user types:

1. **Management** - Pre-registered administrators
2. **Staff** - Pre-registered employees  
3. **Customers** - Insurance policyholders (verified via policy number)

## Authentication Flow

### 1. Mobile Number Entry
- User enters their mobile number
- System sends a 6-digit OTP to the mobile number

### 2. OTP Verification
- User enters the received OTP
- System verifies the OTP

### 3. User Type Detection & Access

#### For Management & Staff (Pre-registered):
- If mobile number exists in database with role `management` or `staff`
- **Immediate access granted** after OTP verification
- No policy number required

#### For Customers (New or Existing):
- If mobile number is NOT pre-registered
- System requests **Policy Number**
- Policy number is verified with insurance company API
- If valid, customer name is retrieved from API
- User account is created/updated with policy information
- Access granted

## API Endpoints

### Backend (Laravel)

All endpoints are prefixed with `/api`

#### Public Endpoints (No Authentication Required)

**Send OTP**
```
POST /auth/send-otp
Body: {
  "mobile_number": "1234567890"
}
Response: {
  "success": true,
  "message": "OTP sent successfully",
  "otp": "123456" // Only in development mode
}
```

**Verify OTP**
```
POST /auth/verify-otp
Body: {
  "mobile_number": "1234567890",
  "otp": "123456"
}
Response (Management/Staff): {
  "success": true,
  "user_type": "management" | "staff",
  "requires_policy": false,
  "user": {...},
  "token": "auth_token"
}
Response (Customer): {
  "success": true,
  "user_type": "customer",
  "requires_policy": true,
  "mobile_number": "1234567890"
}
```

**Verify Policy**
```
POST /auth/verify-policy
Body: {
  "mobile_number": "1234567890",
  "policy_number": "POL123456"
}
Response: {
  "success": true,
  "message": "Policy verified successfully",
  "user": {...},
  "token": "auth_token"
}
```

#### Protected Endpoints (Require Authentication)

**Get Current User**
```
GET /auth/me
Headers: {
  "Authorization": "Bearer {token}"
}
Response: {
  "success": true,
  "user": {...}
}
```

**Logout**
```
POST /auth/logout
Headers: {
  "Authorization": "Bearer {token}"
}
Response: {
  "success": true,
  "message": "Logged out successfully"
}
```

## Database Schema

### Users Table
- `id` - Primary key
- `name` - User's full name
- `email` - Email (nullable)
- `mobile_number` - Mobile number (unique, required)
- `role` - Enum: 'management', 'staff', 'customer'
- `policy_number` - Insurance policy number (nullable, for customers)
- `is_verified` - Boolean flag
- `password` - Nullable (not used for OTP auth)
- `timestamps`

### OTPs Table
- `id` - Primary key
- `mobile_number` - Mobile number
- `otp` - 6-digit OTP code
- `expires_at` - Expiration timestamp (5 minutes)
- `is_used` - Boolean flag
- `timestamps`

## Configuration

### Environment Variables (.env)

```bash
# Insurance Company API Configuration
INSURANCE_API_URL=https://api.insurance-company.com
INSURANCE_API_KEY=your_api_key_here
```

### Services Configuration (config/services.php)

```php
'insurance' => [
    'api_url' => env('INSURANCE_API_URL'),
    'api_key' => env('INSURANCE_API_KEY'),
],
```

## Pre-registered Users (For Testing)

### Management Users
- Mobile: `1234567890` - Admin Manager
- Mobile: `1234567891` - Senior Manager

### Staff Users
- Mobile: `9876543210` - Staff Member 1
- Mobile: `9876543211` - Staff Member 2

## Frontend Integration

### Login Page
Located at `/login`

**Features:**
- Mobile number input
- OTP verification
- Policy number verification (for customers)
- Automatic redirect after successful authentication

### Protected Routes
All main application routes are protected and require authentication:
- `/` - Home
- `/profile` - User Profile
- `/rewards` - Rewards Page
- `/cards` - Cards Page

### Authentication State
- Token stored in `localStorage` as `auth_token`
- User data stored in `localStorage` as `user`

## Development Mode

In development (`APP_ENV=local`):
- OTP is returned in the API response for testing
- Policy verification uses mock data
- No actual SMS is sent

## Production Setup

### Required Changes:

1. **SMS Gateway Integration**
   - Integrate with SMS provider in `AuthController::sendOtp()`
   - Remove OTP from API response

2. **Insurance API Integration**
   - Update `AuthController::checkPolicyWithInsuranceAPI()`
   - Add actual API endpoint and authentication
   - Remove mock data

3. **Security**
   - Enable HTTPS
   - Configure CORS properly
   - Set up rate limiting for OTP requests
   - Implement OTP attempt limits

## Testing the System

### Test as Management/Staff:
1. Go to `/login`
2. Enter mobile: `1234567890`
3. Click "Send OTP"
4. Enter the OTP shown in the toast (development mode)
5. You'll be logged in immediately

### Test as Customer:
1. Go to `/login`
2. Enter any mobile number (not pre-registered)
3. Click "Send OTP"
4. Enter the OTP
5. Enter any policy number
6. System will verify and create your account

## Running the Application

### Backend (Laravel)
```bash
cd backend
php artisan serve
# Runs on http://localhost:8000
```

### Frontend (React)
```bash
npm run dev
# Runs on http://localhost:8080
```

## API Integration Notes

The insurance company needs to provide an API endpoint that:
- Accepts a policy number
- Returns:
  - `valid`: boolean - whether policy exists
  - `customer_name`: string - name of the policyholder
  - `policy_number`: string - confirmed policy number

Example API response format:
```json
{
  "valid": true,
  "customer_name": "John Doe",
  "policy_number": "POL123456",
  "policy_status": "active",
  "policy_type": "comprehensive"
}
```

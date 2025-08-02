# Khabeer Backend Authentication Flow Guide

## Overview

The Khabeer backend supports multiple authentication methods with optional OTP verification. This guide explains the available auth flows and how to bypass OTP for development/testing.

## Authentication Methods

### 1. Email/Password Login
**Endpoint:** `POST /auth/login`
- Traditional login with email and password
- Supports users, providers, and admins
- No OTP required

### 2. Phone Login (Direct)
**Endpoint:** `POST /auth/phone/login`
- Login using phone number with optional password
- No OTP required
- Useful for quick access

### 3. Phone Registration with OTP
**Endpoint:** `POST /auth/phone/register`
- Registration with phone number
- OTP is optional (can be bypassed)
- Supports both users and providers

### 4. Two-Step Registration with OTP
**Step 1:** `POST /auth/register/initiate`
**Step 2:** `POST /auth/register/complete`
- Registration with mandatory OTP verification
- More secure but requires SMS service

## OTP Bypass Configuration

### Environment Variable
Set `ENABLE_OTP=false` to bypass OTP verification:

```bash
# In your .env file or environment
ENABLE_OTP=false
```

### Docker Configuration
The docker-compose files are already configured with OTP disabled by default:

```yaml
environment:
  ENABLE_OTP: ${ENABLE_OTP:-false}
```

### How OTP Bypass Works

When `ENABLE_OTP=false`:

1. **OTP Sending:** Returns success without actually sending SMS
2. **OTP Verification:** Always returns success regardless of the OTP provided
3. **Registration:** Can proceed without valid OTP
4. **Password Reset:** Can reset password without OTP verification

## Quick Start (OTP Bypassed)

### 1. Start the Application
```bash
# Development
docker-compose up -d

# Production
docker-compose -f docker-compose.prod.yml up -d
```

### 2. Register a User
```bash
# Direct registration (no OTP required)
curl -X POST http://localhost:3000/api/auth/phone/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "phoneNumber": "+966500000000",
    "role": "USER"
  }'
```

### 3. Register a Provider
```bash
# Provider registration (no OTP required)
curl -X POST http://localhost:3000/api/auth/phone/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Provider",
    "email": "provider@example.com",
    "password": "password123",
    "phoneNumber": "+966500000001",
    "role": "PROVIDER",
    "description": "Test provider"
  }'
```

### 4. Login
```bash
# Email login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Phone login
curl -X POST http://localhost:3000/api/auth/phone/login \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+966500000000",
    "password": "password123"
  }'
```

## Testing the Auth Flow

Use the provided test script:

```bash
# Run with OTP disabled
ENABLE_OTP=false node test-auth-flow.js

# Run with OTP enabled (requires SMS service)
ENABLE_OTP=true node test-auth-flow.js
```

## Production Deployment

For production, enable OTP verification:

```bash
# Set environment variable
ENABLE_OTP=true

# Or in docker-compose
environment:
  ENABLE_OTP: true
```

## SMS Service Configuration

When OTP is enabled, configure your SMS service:

### Tamimah SMS (Saudi Arabia)
```bash
TAMIMAH_SMS_API_URL=https://api.tamimah.com/sms/send
TAMIMAH_SMS_USERNAME=your_username
TAMIMAH_SMS_PASSWORD=your_password
TAMIMAH_SMS_SENDER_ID=Khabeer
```

### Alternative SMS Providers
```bash
SMS_API_KEY=your_sms_api_key
SMS_API_SECRET=your_sms_api_secret
SMS_SENDER_ID=Khabeer
```

## Security Considerations

1. **Development:** OTP bypass is safe for development and testing
2. **Production:** Always enable OTP verification for security
3. **Rate Limiting:** OTP requests are rate-limited (2 minutes between requests)
4. **Expiration:** OTPs expire after 10 minutes
5. **Attempts:** OTPs are blocked after 5 failed attempts

## Troubleshooting

### OTP Not Working
1. Check `ENABLE_OTP` environment variable
2. Verify SMS service configuration
3. Check SMS service logs
4. Ensure phone number format is correct (+966XXXXXXXXX)

### Registration Fails
1. Check if email/phone already exists
2. Verify required fields are provided
3. Check database connection
4. Review server logs for errors

### Login Issues
1. Verify credentials
2. Check if account is active/verified
3. Ensure JWT secret is configured
4. Check token expiration settings 
# Profile Endpoints Documentation

## Overview

This document describes the new profile endpoints that provide complete user and provider profile information including legal documents, social media links, and support contact information.

## Endpoints

### 1. User Profile

**GET** `/api/users/profile`

**Description**: Get the current authenticated user's complete profile information.

**Authentication**: Required (JWT token)

**Response Format**:

```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "USER",
    "image": "https://example.com/image.jpg",
    "address": "123 Main St",
    "phone": "+966501234567",
    "state": "Riyadh",
    "isActive": true,
    "officialDocuments": "https://example.com/documents.pdf",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "systemInfo": {
    "socialMedia": {
      "facebook": "https://facebook.com/khabeer",
      "twitter": "https://twitter.com/khabeer",
      "instagram": "https://instagram.com/khabeer",
      "linkedin": "https://linkedin.com/company/khabeer",
      "youtube": "https://youtube.com/@khabeer"
    },
    "legalDocuments": {
      "terms_of_service": "https://khabeer.com/legal/terms",
      "privacy_policy": "https://khabeer.com/legal/privacy",
      "user_agreement": "https://khabeer.com/legal/user-agreement",
      "provider_agreement": "https://khabeer.com/legal/provider-agreement",
      "refund_policy": "https://khabeer.com/legal/refund"
    },
    "support": {
      "support_phone": "+966501234567",
      "support_whatsapp": "+966501234567",
      "support_email": "support@khabeer.com",
      "emergency_phone": "+966501234568",
      "business_hours": "24/7"
    }
  }
}
```

### 2. Provider Profile

**GET** `/api/providers/profile`

**Description**: Get the current authenticated provider's complete profile information.

**Authentication**: Required (JWT token with PROVIDER role)

**Response Format**:

```json
{
  "provider": {
    "id": 1,
    "name": "Service Provider",
    "email": "provider@example.com",
    "image": "https://example.com/provider.jpg",
    "description": "Professional service provider",
    "state": "Riyadh",
    "phone": "+966501234567",
    "isActive": true,
    "isVerified": true,
    "location": {
      "lat": 24.7136,
      "lng": 46.6753
    },
    "officialDocuments": "https://example.com/provider-docs.pdf",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "systemInfo": {
    "socialMedia": {
      "facebook": "https://facebook.com/khabeer",
      "twitter": "https://twitter.com/khabeer",
      "instagram": "https://instagram.com/khabeer",
      "linkedin": "https://linkedin.com/company/khabeer",
      "youtube": "https://youtube.com/@khabeer"
    },
    "legalDocuments": {
      "terms_of_service": "https://khabeer.com/legal/terms",
      "privacy_policy": "https://khabeer.com/legal/privacy",
      "user_agreement": "https://khabeer.com/legal/user-agreement",
      "provider_agreement": "https://khabeer.com/legal/provider-agreement",
      "refund_policy": "https://khabeer.com/legal/refund"
    },
    "support": {
      "support_phone": "+966501234567",
      "support_whatsapp": "+966501234567",
      "support_email": "support@khabeer.com",
      "emergency_phone": "+966501234568",
      "business_hours": "24/7"
    }
  }
}
```

## System Information

The profile endpoints return additional system information organized into three categories:

### Social Media Links

- Facebook, Twitter, Instagram, LinkedIn, YouTube URLs
- Stored in `SystemSettings` table with category `'social'`

### Legal Documents

- Terms of Service, Privacy Policy, User Agreement, Provider Agreement, Refund Policy
- Stored in `SystemSettings` table with category `'legal'`

### Support Information

- Support phone numbers, WhatsApp, email, emergency contacts, business hours
- Stored in `SystemSettings` table with category `'support'`

## Setup

### 1. Seed System Settings

Run the following command to populate the system settings:

```bash
npm run seed:system
```

This will create default values for social media, legal documents, and support information.

### 2. Customize Settings

You can customize the system settings through the admin panel or by directly updating the `SystemSettings` table in the database.

## Database Schema

The profile endpoints use the following database models:

- **User**: Basic user information
- **Provider**: Provider-specific information
- **SystemSettings**: System-wide configuration (social media, legal docs, support)

## Error Handling

- **401 Unauthorized**: JWT token missing or invalid
- **403 Forbidden**: User doesn't have required role (for provider profile)
- **404 Not Found**: User/Provider not found
- **500 Internal Server Error**: Database or server error

## Usage Examples

### Get User Profile

```bash
curl -X GET "http://localhost:3000/api/users/profile" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Provider Profile

```bash
curl -X GET "http://localhost:3000/api/providers/profile" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Notes

- Both endpoints require authentication
- Provider profile endpoint requires PROVIDER role
- System information is shared between all users/providers
- Legal documents and support information are centralized for easy updates
- Social media links can be customized per deployment

# Firebase FCM Integration Setup

This guide explains how to set up Firebase Cloud Messaging (FCM) for the Khabeer backend notifications system.

## Prerequisites

1. A Firebase project (create one at https://console.firebase.google.com/)
2. Firebase Admin SDK service account key

## Setup Steps

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable Cloud Messaging in the project settings

### 2. Generate Service Account Key

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Navigate to **Service Accounts** tab
3. Click **Generate New Private Key**
4. Download the JSON file
5. **Keep this file secure** - it contains sensitive credentials

### 3. Configure Environment Variables

Add the following environment variable to your `.env` file:

```env
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"your-project-id","private_key_id":"your-private-key-id","private_key":"-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com","client_id":"your-client-id","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40your-project-id.iam.gserviceaccount.com"}'
```

**Important**: Replace the JSON content with your actual service account key content.

### 4. Mobile App Configuration

For the mobile app to receive FCM notifications, you'll need to:

1. Add the `google-services.json` (Android) or `GoogleService-Info.plist` (iOS) to your mobile app
2. Implement FCM token generation and sending to the backend
3. Handle incoming notifications

## API Endpoints

### Admin Endpoints (Require ADMIN role)

- `POST /notifications` - Create a new notification
- `POST /notifications/:id/send` - Send a notification to target audience
- `GET /notifications` - Get all notifications with pagination
- `GET /notifications/:id` - Get notification by ID
- `DELETE /notifications/:id` - Delete a notification
- `POST /notifications/orders/:orderId` - Send order-specific notification
- `POST /notifications/offers/:offerId` - Send offer-specific notification

### User/Provider Endpoints

- `POST /notifications/users/:userId/fcm-token` - Update user FCM token
- `POST /notifications/providers/:providerId/fcm-token` - Update provider FCM token

## Usage Examples

### Create and Send a General Notification

```bash
# Create notification
curl -X POST http://localhost:3000/notifications \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Welcome to Khabeer!",
    "message": "Thank you for joining our platform.",
    "targetAudience": ["customers", "providers"],
    "notificationType": "general"
  }'

# Send the notification
curl -X POST http://localhost:3000/notifications/1/send \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Update FCM Token for User

```bash
curl -X POST http://localhost:3000/notifications/users/1/fcm-token \
  -H "Authorization: Bearer USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fcmToken": "user_fcm_token_here"
  }'
```

### Send Order Notification

```bash
curl -X POST http://localhost:3000/notifications/orders/1 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Order Update",
    "message": "Your order has been accepted by the provider.",
    "data": {
      "orderStatus": "accepted"
    }
  }'
```

## Notification Types

- `general` - General notifications for all users
- `order` - Order-specific notifications
- `offer` - Offer-specific notifications
- `system` - System notifications

## Target Audiences

- `customers` - Send to all active customers
- `providers` - Send to all active providers
- `all` - Send to both customers and providers

## Error Handling

The system includes comprehensive error handling:

- Invalid FCM tokens are automatically filtered out
- Failed notifications are logged with detailed error messages
- Notification status is updated based on success/failure rates
- Duplicate tokens are automatically removed

## Security Considerations

1. **Keep service account key secure** - Never commit it to version control
2. **Use environment variables** - Store sensitive data in environment variables
3. **Validate FCM tokens** - The system validates tokens before sending
4. **Rate limiting** - Consider implementing rate limiting for notification endpoints
5. **Access control** - Only admins can create and send notifications

## Troubleshooting

### Common Issues

1. **"Firebase Admin SDK not initialized"**

   - Check that `FIREBASE_SERVICE_ACCOUNT` environment variable is set correctly
   - Verify the JSON content is valid

2. **"No FCM tokens found"**

   - Ensure users/providers have updated their FCM tokens
   - Check that users/providers are active

3. **"Failed to send message"**
   - Verify Firebase project configuration
   - Check network connectivity
   - Review Firebase Console for error details

### Debug Mode

Enable debug logging by setting `NODE_ENV=development` in your environment variables.

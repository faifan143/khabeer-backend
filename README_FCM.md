# Firebase FCM Notifications Integration

This document provides a comprehensive guide to the Firebase Cloud Messaging (FCM) integration in the Khabeer backend.

## Overview

The FCM integration allows you to send push notifications to users and providers based on various events in the system. The integration includes:

- **FCM Service**: Handles Firebase Cloud Messaging operations
- **Notifications Service**: Manages notification creation and sending
- **Integration Service**: Provides easy integration with existing business logic
- **Database Schema**: Stores FCM tokens and notification history

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Mobile App    │    │   Backend API    │    │   Firebase FCM  │
│                 │    │                  │    │                 │
│ • Generate FCM  │◄──►│ • Store FCM      │◄──►│ • Send          │
│   Token         │    │   Tokens         │    │   Notifications │
│ • Receive       │    │ • Create         │    │ • Handle        │
│   Notifications │    │   Notifications  │    │   Delivery      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Features

### 1. Notification Types

- **General**: Broadcast notifications to all users
- **Order**: Order-specific notifications (status changes, updates)
- **Offer**: Offer-related notifications
- **System**: System maintenance, updates, etc.

### 2. Target Audiences

- **Customers**: All active customers
- **Providers**: All active providers
- **All**: Both customers and providers

### 3. FCM Token Management

- Automatic token storage for users and providers
- Token validation and cleanup
- Support for multiple devices per user

### 4. Notification Tracking

- Success/failure statistics
- Delivery confirmation
- Historical data storage

## Setup Instructions

### 1. Firebase Project Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Cloud Messaging in Project Settings
3. Generate a service account key:
   - Go to Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Download the JSON file

### 2. Environment Configuration

Add the following to your `.env` file:

```env
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"your-project-id",...}'
```

**Important**: The entire JSON content should be in a single line.

### 3. Database Migration

Run the migration to add FCM token fields:

```bash
npx prisma migrate dev --name add-fcm-tokens
```

## API Endpoints

### Admin Endpoints

#### Create Notification

```http
POST /notifications
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "title": "Welcome to Khabeer!",
  "message": "Thank you for joining our platform.",
  "targetAudience": ["customers", "providers"],
  "notificationType": "general",
  "imageUrl": "https://example.com/image.jpg",
  "data": {
    "action": "view_welcome",
    "screen": "home"
  }
}
```

#### Send Notification

```http
POST /notifications/{id}/send
Authorization: Bearer <admin-token>
```

#### Get Notifications

```http
GET /notifications?page=1&limit=10
Authorization: Bearer <admin-token>
```

#### Delete Notification

```http
DELETE /notifications/{id}
Authorization: Bearer <admin-token>
```

### User/Provider Endpoints

#### Update FCM Token (User)

```http
POST /notifications/users/{userId}/fcm-token
Authorization: Bearer <user-token>
Content-Type: application/json

{
  "fcmToken": "user_fcm_token_here"
}
```

#### Update FCM Token (Provider)

```http
POST /notifications/providers/{providerId}/fcm-token
Authorization: Bearer <provider-token>
Content-Type: application/json

{
  "fcmToken": "provider_fcm_token_here"
}
```

### Specialized Endpoints

#### Order Notifications

```http
POST /notifications/orders/{orderId}
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "title": "Order Update",
  "message": "Your order has been accepted by the provider.",
  "data": {
    "orderStatus": "accepted",
    "action": "view_order"
  }
}
```

#### Offer Notifications

```http
POST /notifications/offers/{offerId}
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "title": "New Special Offer!",
  "message": "Check out this amazing deal from our providers.",
  "data": {
    "offerId": "123",
    "action": "view_offer"
  }
}
```

## Integration Examples

### 1. Order Status Change Integration

```typescript
// In your orders service
import { NotificationIntegrationService } from '../notifications/notification-integration.service';

@Injectable()
export class OrdersService {
  constructor(
    private notificationIntegration: NotificationIntegrationService,
  ) {}

  async updateOrderStatus(orderId: number, newStatus: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    // Update order status
    await this.prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus },
    });

    // Send notification
    await this.notificationIntegration.handleOrderStatusChange(
      orderId,
      newStatus,
      order.status,
    );
  }
}
```

### 2. New Offer Integration

```typescript
// In your offers service
import { NotificationIntegrationService } from '../notifications/notification-integration.service';

@Injectable()
export class OffersService {
  constructor(
    private notificationIntegration: NotificationIntegrationService,
  ) {}

  async createOffer(createOfferDto: CreateOfferDto) {
    const offer = await this.prisma.offer.create({
      data: createOfferDto,
      include: { provider: true },
    });

    // Send notification to all customers
    await this.notificationIntegration.handleNewOffer(
      offer.id,
      offer.title,
      offer.provider.name,
    );

    return offer;
  }
}
```

### 3. Provider Verification Integration

```typescript
// In your provider verification service
import { NotificationIntegrationService } from '../notifications/notification-integration.service';

@Injectable()
export class ProviderVerificationService {
  constructor(
    private notificationIntegration: NotificationIntegrationService,
  ) {}

  async approveProvider(providerId: number) {
    const provider = await this.prisma.provider.findUnique({
      where: { id: providerId },
    });

    // Update verification status
    await this.prisma.providerVerification.update({
      where: { providerId },
      data: { status: 'approved' },
    });

    // Send notification
    await this.notificationIntegration.handleProviderVerificationStatusChange(
      providerId,
      'approved',
      provider.name,
    );
  }
}
```

## Mobile App Integration

### 1. FCM Token Generation

```typescript
// React Native example
import messaging from '@react-native-firebase/messaging';

async function requestUserPermission() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    const fcmToken = await messaging().getToken();
    // Send token to backend
    await updateFcmToken(fcmToken);
  }
}
```

### 2. Token Update to Backend

```typescript
async function updateFcmToken(token: string) {
  const response = await fetch('/notifications/users/1/fcm-token', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${userToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fcmToken: token }),
  });
}
```

### 3. Handle Incoming Notifications

```typescript
// Handle background messages
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log('Message handled in the background!', remoteMessage);

  // Navigate based on notification data
  if (remoteMessage.data?.action === 'view_order') {
    // Navigate to order details
  }
});

// Handle foreground messages
messaging().onMessage(async (remoteMessage) => {
  console.log('A new FCM message arrived!', remoteMessage);

  // Show local notification
  // Navigate to appropriate screen
});
```

## Notification Payload Structure

### Standard FCM Payload

```json
{
  "notification": {
    "title": "Notification Title",
    "body": "Notification message",
    "imageUrl": "https://example.com/image.jpg"
  },
  "data": {
    "notificationId": "123",
    "notificationType": "order",
    "orderId": "456",
    "action": "view_order",
    "screen": "order_details"
  },
  "android": {
    "notification": {
      "sound": "default",
      "priority": "high"
    }
  },
  "apns": {
    "payload": {
      "aps": {
        "sound": "default",
        "badge": 1
      }
    }
  }
}
```

## Error Handling

### Common Error Scenarios

1. **Invalid FCM Token**

   - Tokens are automatically filtered out
   - Failed deliveries are logged
   - No impact on other notifications

2. **Firebase Service Unavailable**

   - Retry mechanism implemented
   - Graceful degradation
   - Error logging for debugging

3. **No Recipients Found**
   - Notification marked as sent with 0 recipients
   - No error thrown
   - Logged for monitoring

### Error Response Format

```json
{
  "success": false,
  "error": "Error message",
  "recipientsCount": 0,
  "successCount": 0,
  "failureCount": 1
}
```

## Monitoring and Analytics

### Notification Statistics

- Total recipients
- Success count
- Failure count
- Delivery rate
- Response time

### Database Queries for Analytics

```sql
-- Get notification success rate
SELECT
  notificationType,
  AVG(successCount::float / NULLIF(recipientsCount, 0)) as success_rate
FROM "Notification"
WHERE status = 'sent'
GROUP BY notificationType;

-- Get daily notification volume
SELECT
  DATE(createdAt) as date,
  COUNT(*) as total_notifications,
  SUM(recipientsCount) as total_recipients
FROM "Notification"
GROUP BY DATE(createdAt)
ORDER BY date DESC;
```

## Security Considerations

### 1. Token Security

- FCM tokens are stored securely in the database
- Tokens are validated before sending
- Invalid tokens are automatically cleaned up

### 2. Access Control

- Only admins can create and send notifications
- Users can only update their own FCM tokens
- Role-based access control implemented

### 3. Rate Limiting

- Consider implementing rate limiting for notification endpoints
- Monitor for abuse patterns
- Set reasonable limits for notification frequency

### 4. Data Privacy

- Notification content is logged for debugging
- Personal data is handled according to privacy policies
- Consider data retention policies for notification logs

## Troubleshooting

### Common Issues

1. **"Firebase Admin SDK not initialized"**

   - Check `FIREBASE_SERVICE_ACCOUNT` environment variable
   - Verify JSON format is correct
   - Ensure no extra quotes or escaping issues

2. **"No FCM tokens found"**

   - Verify users/providers have updated their tokens
   - Check that users/providers are active
   - Ensure mobile app is sending tokens correctly

3. **"Failed to send message"**
   - Check Firebase project configuration
   - Verify network connectivity
   - Review Firebase Console for error details

### Debug Mode

Enable detailed logging:

```typescript
// In your service
this.logger.debug('FCM payload:', fcmPayload);
this.logger.debug('Recipients:', tokens);
```

### Testing

1. **Test with Single Token**

   ```bash
   curl -X POST /notifications/users/1/fcm-token \
     -H "Authorization: Bearer <token>" \
     -d '{"fcmToken": "test_token"}'
   ```

2. **Test Notification Creation**

   ```bash
   curl -X POST /notifications \
     -H "Authorization: Bearer <admin-token>" \
     -d '{"title": "Test", "message": "Test message", "targetAudience": ["customers"]}'
   ```

3. **Test Notification Sending**
   ```bash
   curl -X POST /notifications/1/send \
     -H "Authorization: Bearer <admin-token>"
   ```

## Performance Optimization

### 1. Batch Processing

- Send notifications in batches for large audiences
- Use Firebase's multicast messaging
- Implement queue system for high-volume scenarios

### 2. Token Management

- Regularly clean up invalid tokens
- Implement token refresh mechanism
- Monitor token validity

### 3. Caching

- Cache frequently used notification templates
- Cache user/provider FCM tokens
- Implement Redis for high-performance scenarios

## Future Enhancements

### 1. Advanced Targeting

- Geographic targeting
- Behavioral targeting
- Custom audience segments

### 2. Rich Notifications

- Rich media support
- Interactive notifications
- Deep linking

### 3. Analytics Integration

- Click-through tracking
- Conversion tracking
- A/B testing support

### 4. Template System

- Notification templates
- Dynamic content insertion
- Multi-language support

## Support

For issues and questions:

1. Check the troubleshooting section above
2. Review Firebase Console logs
3. Check application logs for detailed error messages
4. Verify environment configuration
5. Test with minimal payload first

## Related Documentation

- [Firebase Cloud Messaging Documentation](https://firebase.google.com/docs/cloud-messaging)
- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)

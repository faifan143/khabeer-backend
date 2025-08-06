# Channels and Subscriptions System

This document describes the implementation of the channels and subscriptions mechanism for Firebase Cloud Messaging (FCM) notifications in the Khabeer backend.

## Overview

The channels and subscriptions system allows for efficient, topic-based notification delivery to users and providers. Instead of sending notifications to individual FCM tokens, the system uses FCM topics to broadcast messages to subscribed devices.

## Architecture

### Channels

- **Users Channel** (`channel_users`): All users are automatically subscribed to this channel
- **Providers Channel** (`channel_providers`): All providers are automatically subscribed to this channel
- **All Channel** (`channel_all`): Both users and providers are subscribed to this channel

### Key Components

1. **ChannelService**: Manages FCM topic subscriptions and channel-based messaging
2. **ChannelController**: REST API endpoints for channel management
3. **ChannelInitService**: Automatically initializes channel subscriptions on app startup
4. **Enhanced NotificationsService**: Uses channel-based sending instead of individual tokens

## Features

### Automatic Subscription

- Users are automatically subscribed to the `users` channel when they update their FCM token
- Providers are automatically subscribed to the `providers` channel when they update their FCM token
- All existing users and providers are subscribed to channels on application startup

### Manual Subscription Management

- Individual user/provider subscription/unsubscription
- Bulk subscription operations
- Channel statistics and monitoring

### Channel-Based Notification Sending

- Notifications are sent to FCM topics instead of individual tokens
- Better performance and scalability
- Reduced API calls to Firebase

## API Endpoints

### Channel Management

#### Subscribe User to Channel

```http
POST /channels/users/{userId}/subscribe
Authorization: Bearer <token>
Content-Type: application/json

{
  "fcmToken": "user_fcm_token",
  "channel": "users"
}
```

#### Unsubscribe User from Channel

```http
POST /channels/users/{userId}/unsubscribe
Authorization: Bearer <token>
Content-Type: application/json

{
  "fcmToken": "user_fcm_token",
  "channel": "users"
}
```

#### Subscribe Provider to Channel

```http
POST /channels/providers/{providerId}/subscribe
Authorization: Bearer <token>
Content-Type: application/json

{
  "fcmToken": "provider_fcm_token",
  "channel": "providers"
}
```

#### Unsubscribe Provider from Channel

```http
POST /channels/providers/{providerId}/unsubscribe
Authorization: Bearer <token>
Content-Type: application/json

{
  "fcmToken": "provider_fcm_token",
  "channel": "providers"
}
```

### Admin Endpoints

#### Bulk Subscription Action

```http
POST /channels/bulk-subscription
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "fcmTokens": ["token1", "token2", "token3"],
  "channel": "users",
  "action": "subscribe"
}
```

#### Subscribe All Users to Channel

```http
POST /channels/subscribe-all-users/{channel}
Authorization: Bearer <admin_token>
```

#### Subscribe All Providers to Channel

```http
POST /channels/subscribe-all-providers/{channel}
Authorization: Bearer <admin_token>
```

#### Send Notification to Channel

```http
POST /channels/{channel}/send
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "title": "Notification Title",
  "message": "Notification message",
  "imageUrl": "https://example.com/image.jpg",
  "data": {
    "customKey": "customValue"
  }
}
```

#### Get Channel Statistics

```http
GET /channels/statistics
Authorization: Bearer <admin_token>
```

#### Reinitialize Channels

```http
POST /channels/reinitialize
Authorization: Bearer <admin_token>
```

#### Health Check

```http
GET /channels/health
```

## Channel Types

```typescript
enum ChannelType {
  USERS = 'users', // Users channel
  PROVIDERS = 'providers', // Providers channel
  ALL = 'all', // All users and providers
}
```

## Subscription Actions

```typescript
enum SubscriptionAction {
  SUBSCRIBE = 'subscribe',
  UNSUBSCRIBE = 'unsubscribe',
}
```

## Usage Examples

### 1. Automatic Subscription (Happens on FCM Token Update)

When a user updates their FCM token via the existing endpoint:

```http
POST /notifications/users/{userId}/fcm-token
```

The system automatically:

1. Updates the user's FCM token in the database
2. Subscribes the user to the `users` channel
3. Subscribes the user to the `all` channel

### 2. Sending Notifications via Channels

When creating and sending a notification:

```http
POST /notifications
{
  "title": "New Service Available",
  "message": "Check out our latest service offerings",
  "targetAudience": ["providers"],
  "notificationType": "general"
}
```

The system:

1. Maps `targetAudience` to appropriate channels
2. Sends the notification to the `providers` channel
3. All subscribed providers receive the notification

### 3. Manual Channel Management

Subscribe a specific user to a channel:

```http
POST /channels/users/123/subscribe
{
  "fcmToken": "user_fcm_token",
  "channel": "all"
}
```

### 4. Bulk Operations

Subscribe multiple tokens to a channel:

```http
POST /channels/bulk-subscription
{
  "fcmTokens": ["token1", "token2", "token3"],
  "channel": "users",
  "action": "subscribe"
}
```

## Benefits

### Performance

- **Reduced API Calls**: Instead of sending to individual tokens, send to topics
- **Better Scalability**: FCM topics handle large subscriber bases efficiently
- **Faster Delivery**: Topic-based delivery is optimized by Firebase

### Management

- **Automatic Subscription**: Users/providers are automatically subscribed to appropriate channels
- **Easy Targeting**: Send to specific audiences without managing individual tokens
- **Monitoring**: Track subscription statistics and channel health

### Flexibility

- **Manual Control**: Override automatic subscriptions when needed
- **Bulk Operations**: Manage multiple subscriptions efficiently
- **Channel Isolation**: Separate channels for different user types

## Implementation Details

### Topic Naming Convention

- `channel_users`: Users channel
- `channel_providers`: Providers channel
- `channel_all`: All users and providers

### Automatic Initialization

On application startup, `ChannelInitService` automatically:

1. Subscribes all users with FCM tokens to the `users` channel
2. Subscribes all providers with FCM tokens to the `providers` channel
3. Subscribes all users and providers to the `all` channel

### Error Handling

- Failed subscriptions are logged but don't break the application
- Individual token failures don't affect other tokens in bulk operations
- Graceful degradation when FCM services are unavailable

### Monitoring

- Channel statistics show subscriber counts
- Health check endpoint for service monitoring
- Detailed logging for debugging and monitoring

## Migration from Token-Based to Channel-Based

The system maintains backward compatibility while providing channel-based benefits:

1. **Existing Notifications**: Continue to work as before
2. **FCM Token Updates**: Automatically trigger channel subscriptions
3. **Gradual Migration**: New notifications use channels, old ones continue working
4. **Manual Override**: Can still send to individual tokens when needed

## Security Considerations

- All channel management endpoints require authentication
- Admin-only endpoints for bulk operations and statistics
- FCM token validation before subscription
- Rate limiting on subscription endpoints (implemented by Firebase)

## Troubleshooting

### Common Issues

1. **Subscription Failures**

   - Check FCM token validity
   - Verify Firebase configuration
   - Check network connectivity

2. **Notification Delivery Issues**

   - Verify channel subscriptions
   - Check FCM topic names
   - Review Firebase console for delivery status

3. **Performance Issues**
   - Monitor channel statistics
   - Check for duplicate subscriptions
   - Review bulk operation sizes

### Debugging

1. **Check Channel Statistics**

   ```http
   GET /channels/statistics
   ```

2. **Reinitialize Channels**

   ```http
   POST /channels/reinitialize
   ```

3. **Health Check**
   ```http
   GET /channels/health
   ```

## Future Enhancements

1. **Custom Channels**: Allow creation of custom channels for specific use cases
2. **Channel Categories**: Organize channels by category (promotions, updates, etc.)
3. **Subscription Preferences**: Allow users to choose which channels to subscribe to
4. **Analytics**: Track notification engagement and delivery rates
5. **A/B Testing**: Test different notification strategies across channels

## Integration with Mobile Apps

Mobile applications should:

1. **Register FCM Token**: Send FCM token to backend when obtained
2. **Handle Topic Messages**: Process notifications sent to subscribed topics
3. **Update Token**: Send updated FCM token when it changes
4. **Handle Channel Data**: Process channel information in notification payload

Example mobile app integration:

```javascript
// Register FCM token
const token = await messaging.getToken();
await fetch('/notifications/users/123/fcm-token', {
  method: 'POST',
  headers: { Authorization: `Bearer ${userToken}` },
  body: JSON.stringify({ fcmToken: token }),
});

// Handle incoming messages
messaging.onMessage((payload) => {
  const channel = payload.data?.channel;
  // Handle notification based on channel
});
```

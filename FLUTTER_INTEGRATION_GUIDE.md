# Flutter Integration Guide for Channels and Subscriptions

This guide provides step-by-step instructions for integrating the channels and subscriptions system into your Flutter apps (both providers and users apps).

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Setup Firebase in Flutter](#setup-firebase-in-flutter)
3. [Install Dependencies](#install-dependencies)
4. [Configure Firebase Messaging](#configure-firebase-messaging)
5. [Create FCM Service](#create-fcm-service)
6. [User App Integration](#user-app-integration)
7. [Provider App Integration](#provider-app-integration)
8. [Testing the Integration](#testing-the-integration)
9. [Troubleshooting](#troubleshooting)

## Prerequisites

- Flutter SDK (latest stable version)
- Firebase project with FCM enabled
- Backend API running with channels system
- User authentication system in place

## Setup Firebase in Flutter

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing one
3. Enable Cloud Messaging
4. Download `google-services.json` (Android) and `GoogleService-Info.plist` (iOS)

### 2. Add Firebase to Flutter Project

#### Android Setup

1. Place `google-services.json` in `android/app/`
2. Update `android/build.gradle`:

```gradle
buildscript {
    dependencies {
        classpath 'com.google.gms:google-services:4.3.15'
    }
}
```

3. Update `android/app/build.gradle`:

```gradle
apply plugin: 'com.google.gms.google-services'

android {
    defaultConfig {
        minSdkVersion 19
        multiDexEnabled true
    }
}

dependencies {
    implementation 'com.google.firebase:firebase-messaging:23.2.1'
    implementation 'com.google.firebase:firebase-analytics:21.3.0'
}
```

#### iOS Setup

1. Place `GoogleService-Info.plist` in `ios/Runner/`
2. Update `ios/Runner/Info.plist`:

```xml
<key>FirebaseAppDelegateProxyEnabled</key>
<false/>
<key>UIBackgroundModes</key>
<array>
    <string>fetch</string>
    <string>remote-notification</string>
</array>
```

## Install Dependencies

Add these dependencies to your `pubspec.yaml`:

```yaml
dependencies:
  flutter:
    sdk: flutter

  # Firebase
  firebase_core: ^2.15.1
  firebase_messaging: ^14.6.7

  # HTTP requests
  http: ^1.1.0

  # Local storage
  shared_preferences: ^2.2.0

  # State management (choose one)
  provider: ^6.0.5
  # or
  # bloc: ^8.1.2

  # JSON serialization
  json_annotation: ^4.8.1

dev_dependencies:
  json_serializable: ^6.7.1
  build_runner: ^2.4.6
```

Run:

```bash
flutter pub get
```

## Configure Firebase Messaging

### 1. Initialize Firebase

In your `main.dart`:

```dart
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();

  // Initialize FCM
  await FirebaseMessaging.instance.requestPermission(
    alert: true,
    badge: true,
    sound: true,
  );

  runApp(MyApp());
}
```

### 2. Create FCM Service

Create `lib/services/fcm_service.dart`:

```dart
import 'dart:convert';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class FCMService {
  static final FCMService _instance = FCMService._internal();
  factory FCMService() => _instance;
  FCMService._internal();

  final FirebaseMessaging _messaging = FirebaseMessaging.instance;
  final String _baseUrl = 'YOUR_BACKEND_URL'; // e.g., 'https://api.khabeer.com'

  String? _fcmToken;
  String? _userToken;
  int? _userId;
  bool _isProvider = false;

  // Getters
  String? get fcmToken => _fcmToken;
  String? get userToken => _userToken;
  int? get userId => _userId;
  bool get isProvider => _isProvider;

  /// Initialize FCM service
  Future<void> initialize({required String userToken, required int userId, required bool isProvider}) async {
    _userToken = userToken;
    _userId = userId;
    _isProvider = isProvider;

    // Get FCM token
    _fcmToken = await _messaging.getToken();

    if (_fcmToken != null) {
      // Save token locally
      await _saveTokenLocally();

      // Send token to backend
      await _sendTokenToBackend();

      // Setup message handlers
      _setupMessageHandlers();
    }

    // Listen for token refresh
    _messaging.onTokenRefresh.listen((newToken) async {
      _fcmToken = newToken;
      await _saveTokenLocally();
      await _sendTokenToBackend();
    });
  }

  /// Save FCM token locally
  Future<void> _saveTokenLocally() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('fcm_token', _fcmToken!);
  }

  /// Send FCM token to backend
  Future<void> _sendTokenToBackend() async {
    if (_fcmToken == null || _userToken == null || _userId == null) return;

    try {
      final endpoint = _isProvider
          ? '$_baseUrl/notifications/providers/$_userId/fcm-token'
          : '$_baseUrl/notifications/users/$_userId/fcm-token';

      final response = await http.post(
        Uri.parse(endpoint),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $_userToken',
        },
        body: jsonEncode({
          'fcmToken': _fcmToken,
        }),
      );

      if (response.statusCode == 200) {
        print('FCM token sent to backend successfully');
      } else {
        print('Failed to send FCM token: ${response.statusCode}');
      }
    } catch (e) {
      print('Error sending FCM token: $e');
    }
  }

  /// Setup message handlers
  void _setupMessageHandlers() {
    // Handle foreground messages
    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      _handleForegroundMessage(message);
    });

    // Handle background messages
    FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

    // Handle when app is opened from notification
    FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
      _handleNotificationTap(message);
    });
  }

  /// Handle foreground messages
  void _handleForegroundMessage(RemoteMessage message) {
    print('Received foreground message: ${message.messageId}');

    // Extract channel information
    final channel = message.data['channel'];
    final notificationType = message.data['notificationType'];

    // Show local notification
    _showLocalNotification(message);

    // Handle based on channel and type
    _handleMessageByChannel(channel, notificationType, message.data);
  }

  /// Handle notification tap
  void _handleNotificationTap(RemoteMessage message) {
    final channel = message.data['channel'];
    final notificationType = message.data['notificationType'];

    // Navigate based on notification type
    _navigateBasedOnNotification(notificationType, message.data);
  }

  /// Show local notification
  void _showLocalNotification(RemoteMessage message) {
    // You can use flutter_local_notifications package here
    // For now, we'll just print the notification
    print('Notification: ${message.notification?.title}');
    print('Body: ${message.notification?.body}');
  }

  /// Handle message based on channel
  void _handleMessageByChannel(String? channel, String? notificationType, Map<String, dynamic> data) {
    switch (channel) {
      case 'users':
        if (!_isProvider) {
          _handleUserChannelMessage(notificationType, data);
        }
        break;
      case 'providers':
        if (_isProvider) {
          _handleProviderChannelMessage(notificationType, data);
        }
        break;
      case 'all':
        _handleAllChannelMessage(notificationType, data);
        break;
    }
  }

  /// Handle user channel messages
  void _handleUserChannelMessage(String? notificationType, Map<String, dynamic> data) {
    switch (notificationType) {
      case 'order':
        _handleOrderNotification(data);
        break;
      case 'offer':
        _handleOfferNotification(data);
        break;
      case 'general':
        _handleGeneralNotification(data);
        break;
      case 'system':
        _handleSystemNotification(data);
        break;
    }
  }

  /// Handle provider channel messages
  void _handleProviderChannelMessage(String? notificationType, Map<String, dynamic> data) {
    switch (notificationType) {
      case 'order':
        _handleOrderNotification(data);
        break;
      case 'offer':
        _handleOfferNotification(data);
        break;
      case 'general':
        _handleGeneralNotification(data);
        break;
      case 'system':
        _handleSystemNotification(data);
        break;
    }
  }

  /// Handle all channel messages
  void _handleAllChannelMessage(String? notificationType, Map<String, dynamic> data) {
    // Handle messages sent to all users
    _handleGeneralNotification(data);
  }

  /// Handle order notifications
  void _handleOrderNotification(Map<String, dynamic> data) {
    final orderId = data['orderId'];
    if (orderId != null) {
      // Navigate to order details
      _navigateToOrderDetails(int.parse(orderId));
    }
  }

  /// Handle offer notifications
  void _handleOfferNotification(Map<String, dynamic> data) {
    final offerId = data['offerId'];
    if (offerId != null) {
      // Navigate to offer details
      _navigateToOfferDetails(int.parse(offerId));
    }
  }

  /// Handle general notifications
  void _handleGeneralNotification(Map<String, dynamic> data) {
    // Handle general notifications (promotions, updates, etc.)
    print('General notification received: $data');
  }

  /// Handle system notifications
  void _handleSystemNotification(Map<String, dynamic> data) {
    // Handle system notifications (maintenance, updates, etc.)
    print('System notification received: $data');
  }

  /// Navigate based on notification type
  void _navigateBasedOnNotification(String? notificationType, Map<String, dynamic> data) {
    switch (notificationType) {
      case 'order':
        final orderId = data['orderId'];
        if (orderId != null) {
          _navigateToOrderDetails(int.parse(orderId));
        }
        break;
      case 'offer':
        final offerId = data['offerId'];
        if (offerId != null) {
          _navigateToOfferDetails(int.parse(offerId));
        }
        break;
      default:
        // Navigate to notifications screen
        _navigateToNotifications();
        break;
    }
  }

  /// Navigate to order details
  void _navigateToOrderDetails(int orderId) {
    // Implement navigation to order details screen
    print('Navigate to order details: $orderId');
  }

  /// Navigate to offer details
  void _navigateToOfferDetails(int offerId) {
    // Implement navigation to offer details screen
    print('Navigate to offer details: $offerId');
  }

  /// Navigate to notifications screen
  void _navigateToNotifications() {
    // Implement navigation to notifications screen
    print('Navigate to notifications screen');
  }

  /// Manually subscribe to a channel
  Future<bool> subscribeToChannel(String channel) async {
    if (_fcmToken == null || _userToken == null || _userId == null) return false;

    try {
      final endpoint = _isProvider
          ? '$_baseUrl/channels/providers/$_userId/subscribe'
          : '$_baseUrl/channels/users/$_userId/subscribe';

      final response = await http.post(
        Uri.parse(endpoint),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $_userToken',
        },
        body: jsonEncode({
          'fcmToken': _fcmToken,
          'channel': channel,
        }),
      );

      return response.statusCode == 200;
    } catch (e) {
      print('Error subscribing to channel: $e');
      return false;
    }
  }

  /// Manually unsubscribe from a channel
  Future<bool> unsubscribeFromChannel(String channel) async {
    if (_fcmToken == null || _userToken == null || _userId == null) return false;

    try {
      final endpoint = _isProvider
          ? '$_baseUrl/channels/providers/$_userId/unsubscribe'
          : '$_baseUrl/channels/users/$_userId/unsubscribe';

      final response = await http.post(
        Uri.parse(endpoint),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $_userToken',
        },
        body: jsonEncode({
          'fcmToken': _fcmToken,
          'channel': channel,
        }),
      );

      return response.statusCode == 200;
    } catch (e) {
      print('Error unsubscribing from channel: $e');
      return false;
    }
  }

  /// Get stored FCM token
  Future<String?> getStoredToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('fcm_token');
  }

  /// Clear stored data
  Future<void> clearData() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('fcm_token');
    _fcmToken = null;
    _userToken = null;
    _userId = null;
  }
}

// Background message handler (must be top-level function)
@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp();
  print('Handling background message: ${message.messageId}');
}
```

## User App Integration

### 1. Initialize FCM in User App

In your user app's main authentication flow:

```dart
import 'package:your_app/services/fcm_service.dart';

class AuthService {
  final FCMService _fcmService = FCMService();

  Future<void> loginUser(String email, String password) async {
    // Your existing login logic
    final response = await _apiService.login(email, password);

    if (response.success) {
      // Initialize FCM after successful login
      await _fcmService.initialize(
        userToken: response.token,
        userId: response.user.id,
        isProvider: false, // Users app
      );
    }
  }

  Future<void> logout() async {
    // Clear FCM data
    await _fcmService.clearData();

    // Your existing logout logic
    await _apiService.logout();
  }
}
```

### 2. Create Notification Handler

Create `lib/services/notification_handler.dart`:

```dart
import 'package:flutter/material.dart';

class NotificationHandler {
  static final NotificationHandler _instance = NotificationHandler._internal();
  factory NotificationHandler() => _instance;
  NotificationHandler._internal();

  final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();

  /// Handle order notifications
  void handleOrderNotification(int orderId) {
    navigatorKey.currentState?.pushNamed(
      '/order-details',
      arguments: orderId,
    );
  }

  /// Handle offer notifications
  void handleOfferNotification(int offerId) {
    navigatorKey.currentState?.pushNamed(
      '/offer-details',
      arguments: offerId,
    );
  }

  /// Handle general notifications
  void handleGeneralNotification() {
    navigatorKey.currentState?.pushNamed('/notifications');
  }
}
```

### 3. Update Main App

```dart
import 'package:flutter/material.dart';
import 'package:your_app/services/notification_handler.dart';

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      navigatorKey: NotificationHandler().navigatorKey,
      // ... rest of your app configuration
    );
  }
}
```

## Provider App Integration

### 1. Initialize FCM in Provider App

```dart
import 'package:your_app/services/fcm_service.dart';

class ProviderAuthService {
  final FCMService _fcmService = FCMService();

  Future<void> loginProvider(String email, String password) async {
    // Your existing login logic
    final response = await _apiService.login(email, password);

    if (response.success) {
      // Initialize FCM after successful login
      await _fcmService.initialize(
        userToken: response.token,
        userId: response.provider.id,
        isProvider: true, // Providers app
      );
    }
  }

  Future<void> logout() async {
    // Clear FCM data
    await _fcmService.clearData();

    // Your existing logout logic
    await _apiService.logout();
  }
}
```

### 2. Provider-Specific Notification Handler

```dart
import 'package:flutter/material.dart';

class ProviderNotificationHandler {
  static final ProviderNotificationHandler _instance = ProviderNotificationHandler._internal();
  factory ProviderNotificationHandler() => _instance;
  ProviderNotificationHandler._internal();

  final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();

  /// Handle new order notifications
  void handleNewOrderNotification(int orderId) {
    navigatorKey.currentState?.pushNamed(
      '/provider/order-details',
      arguments: orderId,
    );
  }

  /// Handle order status updates
  void handleOrderStatusUpdate(int orderId) {
    navigatorKey.currentState?.pushNamed(
      '/provider/order-details',
      arguments: orderId,
    );
  }

  /// Handle offer notifications
  void handleOfferNotification(int offerId) {
    navigatorKey.currentState?.pushNamed(
      '/provider/offer-details',
      arguments: offerId,
    );
  }

  /// Handle general notifications
  void handleGeneralNotification() {
    navigatorKey.currentState?.pushNamed('/provider/notifications');
  }
}
```

## Testing the Integration

### 1. Test FCM Token Registration

```dart
// Test in your app
void testFCMIntegration() async {
  final fcmService = FCMService();

  // Check if token is stored
  final storedToken = await fcmService.getStoredToken();
  print('Stored FCM token: $storedToken');

  // Test channel subscription
  final success = await fcmService.subscribeToChannel('all');
  print('Channel subscription: $success');
}
```

### 2. Test Notification Reception

1. Send a test notification from your backend
2. Check if the app receives the notification
3. Verify navigation works correctly
4. Test background and foreground scenarios

### 3. Test Channel Management

```dart
// Test manual channel subscription
await fcmService.subscribeToChannel('users');
await fcmService.subscribeToChannel('all');

// Test unsubscription
await fcmService.unsubscribeFromChannel('users');
```

## Troubleshooting

### Common Issues

1. **FCM Token Not Generated**

   - Check Firebase configuration
   - Verify `google-services.json` is in correct location
   - Check internet connectivity

2. **Notifications Not Received**

   - Verify FCM token is sent to backend
   - Check if user is subscribed to correct channels
   - Verify notification permissions

3. **Navigation Not Working**

   - Check if `navigatorKey` is properly set
   - Verify route names are correct
   - Check if context is available

4. **Background Notifications Not Working**
   - Verify `_firebaseMessagingBackgroundHandler` is top-level
   - Check iOS background modes
   - Verify Android manifest permissions

### Debug Steps

1. **Enable Debug Logging**

```dart
// Add to main.dart
FirebaseMessaging.onMessage.listen((RemoteMessage message) {
  print('Foreground message: ${message.data}');
});
```

2. **Check FCM Token**

```dart
final token = await FirebaseMessaging.instance.getToken();
print('FCM Token: $token');
```

3. **Verify Backend Response**

```dart
// Check if token is successfully sent to backend
final response = await http.post(/* your endpoint */);
print('Backend response: ${response.statusCode}');
```

### Platform-Specific Issues

#### Android

- Check `minSdkVersion` is 19 or higher
- Verify `google-services.json` is in `android/app/`
- Check manifest permissions

#### iOS

- Verify `GoogleService-Info.plist` is in `ios/Runner/`
- Check background modes in `Info.plist`
- Verify provisioning profile includes push notifications

## Best Practices

1. **Error Handling**: Always handle FCM errors gracefully
2. **Token Management**: Store and refresh tokens properly
3. **User Experience**: Show loading states during token registration
4. **Testing**: Test on both platforms and different scenarios
5. **Security**: Never log sensitive tokens in production
6. **Performance**: Avoid unnecessary API calls
7. **User Preferences**: Allow users to control notification settings

## Example Usage

### Complete Integration Example

```dart
// main.dart
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:your_app/services/fcm_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();

  // Request notification permissions
  await FirebaseMessaging.instance.requestPermission(
    alert: true,
    badge: true,
    sound: true,
  );

  runApp(MyApp());
}

// In your login screen
class LoginScreen extends StatefulWidget {
  @override
  _LoginScreenState createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final FCMService _fcmService = FCMService();
  bool _isLoading = false;

  Future<void> _login() async {
    setState(() => _isLoading = true);

    try {
      // Your login logic
      final response = await authService.login(email, password);

      if (response.success) {
        // Initialize FCM
        await _fcmService.initialize(
          userToken: response.token,
          userId: response.user.id,
          isProvider: false, // or true for provider app
        );

        // Navigate to home
        Navigator.pushReplacementNamed(context, '/home');
      }
    } catch (e) {
      // Handle error
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _isLoading
        ? Center(child: CircularProgressIndicator())
        : LoginForm(onLogin: _login),
    );
  }
}
```

This comprehensive guide should help you integrate the channels and subscriptions system into both your user and provider Flutter apps successfully!

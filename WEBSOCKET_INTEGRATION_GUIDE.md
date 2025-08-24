# 🌐 WebSocket Integration Guide for Frontend Developers

## 📋 Overview

This guide provides everything frontend developers need to integrate with the real-time location tracking system using WebSocket connections.

## 🚀 Quick Start

### 1. Install Socket.IO Client

**Flutter (Dart):**

```bash
flutter pub add socket_io_client
```

**React/JavaScript:**

```bash
npm install socket.io-client
```

**React Native:**

```bash
npm install socket.io-client
```

### 2. Connect to WebSocket

```dart
// Flutter Example
import 'package:socket_io_client/socket_io_client.dart' as IO;

class LocationTrackingService {
  late IO.Socket socket;

  void connect(String baseUrl, String jwtToken) {
    socket = IO.io('$baseUrl/location-tracking', <String, dynamic>{
      'transports': ['websocket'],
      'autoConnect': false,
      'auth': {'token': jwtToken}
    });

    socket.connect();

    // Listen for connection events
    socket.onConnect((_) {
      print('Connected to location tracking service');
    });

    socket.onDisconnect((_) {
      print('Disconnected from location tracking service');
    });
  }
}
```

## 🔐 Authentication

### JWT Token Required

All WebSocket connections require a valid JWT token in the authentication payload.

```dart
// Include JWT token in connection
socket = IO.io('$baseUrl/location-tracking', <String, dynamic>{
  'auth': {'token': 'your_jwt_token_here'}
});
```

### Token Validation

- Token must be valid and not expired
- Token must contain `userId` and `role` claims
- Invalid tokens will result in immediate disconnection

## 📡 Available Socket Events

### Provider Events (SEND)

#### 1. Start Location Tracking

```dart
// Provider starts tracking for a specific order
socket.emit('start_tracking', {
  'orderId': 'booking_id_123',
  'updateInterval': 30  // Optional: seconds between updates (default: 30)
});
```

**Response:**

```json
{
  "success": true,
  "orderId": "booking_id_123",
  "updateInterval": 30,
  "message": "Location tracking started successfully"
}
```

#### 2. Update Location

```dart
// Provider sends current GPS coordinates
socket.emit('update_location', {
  'latitude': 25.2048,
  'longitude': 55.2708,
  'accuracy': 5.0,      // GPS accuracy in meters
  'orderId': 'booking_id_123'
});
```

**Response:**

```json
{
  "success": true,
  "locationId": 123,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### 3. Stop Location Tracking

```dart
// Provider stops tracking for a specific order
socket.emit('stop_tracking', {
  'orderId': 'booking_id_123'
});
```

**Response:**

```json
{
  "success": true,
  "orderId": "booking_id_123",
  "message": "Location tracking stopped successfully"
}
```

### User Events (RECEIVE)

#### 1. Provider Tracking Started

```dart
socket.on('provider_tracking_started', (data) {
  print('Provider started tracking order: ${data['orderId']}');
  // Update UI to show tracking is active
});
```

**Data:**

```json
{
  "orderId": "booking_id_123",
  "providerId": 456,
  "message": "Provider has started location tracking"
}
```

#### 2. Provider Location Updated

```dart
socket.on('provider_location_updated', (data) {
  final location = data['location'];
  print('Provider location: ${location['latitude']}, ${location['longitude']}');
  print('Accuracy: ±${location['accuracy']} meters');

  // Update map with provider's new location
  updateProviderMarker(location['latitude'], location['longitude']);
});
```

**Data:**

```json
{
  "orderId": "booking_id_123",
  "providerId": 456,
  "location": {
    "latitude": 25.2048,
    "longitude": 55.2708,
    "accuracy": 5.0,
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

#### 3. Provider Tracking Stopped

```dart
socket.on('provider_tracking_stopped', (data) {
  print('Provider stopped tracking order: ${data['orderId']}');
  // Update UI to show tracking is inactive
});
```

**Data:**

```json
{
  "orderId": "booking_id_123",
  "providerId": 456,
  "message": "Provider has stopped location tracking"
}
```

### User Events (SEND)

#### 1. Start Order Tracking

```dart
// User starts listening to provider location for a specific order
socket.emit('track_order', {
  'orderId': 'booking_id_123'
});
```

**Response:**

```json
{
  "orderId": "booking_id_123",
  "currentLocation": {
    "latitude": 25.2048,
    "longitude": 55.2708,
    "accuracy": 5.0,
    "timestamp": "2024-01-15T10:30:00.000Z"
  },
  "isTracking": true,
  "providerId": 456,
  "message": "Started tracking order location"
}
```

#### 2. Stop Order Tracking

```dart
// User stops listening to provider location
socket.emit('stop_tracking_order', {
  'orderId': 'booking_id_123'
});
```

**Response:**

```json
{
  "orderId": "booking_id_123",
  "message": "Stopped tracking order location"
}
```

## 🗺️ Complete Flutter Implementation Example

```dart
import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'package:google_maps_flutter/google_maps_flutter.dart';

class LocationTrackingService {
  late IO.Socket socket;
  final String baseUrl;
  final String jwtToken;

  LocationTrackingService(this.baseUrl, this.jwtToken);

  // Connect to WebSocket
  void connect() {
    socket = IO.io('$baseUrl/location-tracking', <String, dynamic>{
      'transports': ['websocket'],
      'autoConnect': false,
      'auth': {'token': jwtToken}
    });

    _setupEventListeners();
    socket.connect();
  }

  // Setup all event listeners
  void _setupEventListeners() {
    // Connection events
    socket.onConnect((_) => print('Connected to location tracking'));
    socket.onDisconnect((_) => print('Disconnected from location tracking'));

    // Provider tracking events (for users)
    socket.on('provider_tracking_started', _handleProviderTrackingStarted);
    socket.on('provider_location_updated', _handleProviderLocationUpdated);
    socket.on('provider_tracking_stopped', _handleProviderTrackingStopped);

    // Order tracking events (for users)
    socket.on('order_tracking_started', _handleOrderTrackingStarted);
    socket.on('order_tracking_stopped', _handleOrderTrackingStopped);

    // Error handling
    socket.on('error', _handleError);
  }

  // Provider methods
  void startTracking(String orderId, {int updateInterval = 30}) {
    socket.emit('start_tracking', {
      'orderId': orderId,
      'updateInterval': updateInterval
    });
  }

  void updateLocation(double latitude, double longitude, double accuracy, String orderId) {
    socket.emit('update_location', {
      'latitude': latitude,
      'longitude': longitude,
      'accuracy': accuracy,
      'orderId': orderId
    });
  }

  void stopTracking(String orderId) {
    socket.emit('stop_tracking', {'orderId': orderId});
  }

  // User methods
  void trackOrder(String orderId) {
    socket.emit('track_order', {'orderId': orderId});
  }

  void stopTrackingOrder(String orderId) {
    socket.emit('stop_tracking_order', {'orderId': orderId});
  }

  // Event handlers
  void _handleProviderTrackingStarted(dynamic data) {
    print('Provider started tracking: ${data['orderId']}');
    // Update UI state
  }

  void _handleProviderLocationUpdated(dynamic data) {
    final location = data['location'];
    print('Provider location: ${location['latitude']}, ${location['longitude']}');

    // Update map marker
    _updateProviderMarker(
      location['latitude'],
      location['longitude'],
      location['accuracy']
    );
  }

  void _handleProviderTrackingStopped(dynamic data) {
    print('Provider stopped tracking: ${data['orderId']}');
    // Update UI state
  }

  void _handleOrderTrackingStarted(dynamic data) {
    print('Order tracking started: ${data['orderId']}');
    // Update UI state
  }

  void _handleOrderTrackingStopped(dynamic data) {
    print('Order tracking stopped: ${data['orderId']}');
    // Update UI state
  }

  void _handleError(dynamic data) {
    print('Socket error: ${data['message']}');
    // Handle error in UI
  }

  // Map update method
  void _updateProviderMarker(double latitude, double longitude, double accuracy) {
    // Update your map with provider's location
    // This will depend on your map implementation
  }

  // Disconnect
  void disconnect() {
    socket.disconnect();
  }
}
```

## 📱 Usage Examples

### Provider App (Sharing Location)

```dart
class ProviderLocationTracker {
  final LocationTrackingService _trackingService;

  void startOrderTracking(String orderId) {
    // Start tracking when provider accepts order
    _trackingService.startTracking(orderId);

    // Set up periodic location updates
    Timer.periodic(Duration(seconds: 30), (timer) {
      _updateLocation(orderId);
    });
  }

  void _updateLocation(String orderId) async {
    // Get current GPS location
    Position position = await Geolocator.getCurrentPosition(
      desiredAccuracy: LocationAccuracy.high
    );

    // Send to WebSocket
    _trackingService.updateLocation(
      position.latitude,
      position.longitude,
      position.accuracy,
      orderId
    );
  }

  void stopOrderTracking(String orderId) {
    _trackingService.stopTracking(orderId);
  }
}
```

### User App (Receiving Location)

```dart
class UserLocationTracker {
  final LocationTrackingService _trackingService;

  void startTrackingProvider(String orderId) {
    // Start listening to provider location
    _trackingService.trackOrder(orderId);
  }

  void stopTrackingProvider(String orderId) {
    // Stop listening to provider location
    _trackingService.stopTrackingOrder(orderId);
  }
}
```

## 🔧 Configuration

### WebSocket URL

```
ws://your-api-domain.com/location-tracking
```

### Required Headers

- **Authentication**: JWT token in connection payload
- **Content-Type**: application/json (for HTTP fallback)

### Connection Options

- **Transports**: WebSocket (primary), HTTP long-polling (fallback)
- **Auto-connect**: false (manual connection control)
- **Reconnection**: Automatic with exponential backoff

## ⚠️ Important Notes

### 1. Order Status Requirements

- Location tracking only works with orders in `accepted` or `in_progress` status
- Providers cannot start tracking for `pending`, `completed`, or `cancelled` orders

### 2. Permission Requirements

- **Providers**: Can only track their own accepted orders
- **Users**: Can only track their own orders
- **Authentication**: Required for all connections

### 3. Data Persistence

- All location updates are stored in the database
- Location history is available for completed orders
- Active tracking data is stored in memory for real-time updates

### 4. Error Handling

- Invalid order IDs will return error messages
- Authentication failures will disconnect the socket
- Network issues will trigger automatic reconnection

## 🧪 Testing

### Test WebSocket Connection

```dart
// Test connection
void testConnection() {
  _trackingService.connect();

  // Check if connected
  if (socket.connected) {
    print('WebSocket connection successful');
  }
}
```

### Test Location Updates

```dart
// Test location update (for providers)
void testLocationUpdate() {
  _trackingService.updateLocation(
    25.2048,  // Test latitude
    55.2708,  // Test longitude
    5.0,      // Test accuracy
    'test_order_123'
  );
}
```

## 📞 Support

For technical support or questions about the WebSocket integration:

1. **Check the logs** for connection and error messages
2. **Verify JWT token** is valid and not expired
3. **Confirm order status** is `accepted` or `in_progress`
4. **Check network connectivity** and firewall settings

---

**Happy coding! 🚀**

This WebSocket system provides real-time location tracking between providers and users, enabling live map updates and enhanced user experience.

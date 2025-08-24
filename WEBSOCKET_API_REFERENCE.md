# 📡 WebSocket API Reference

## 🔗 Connection Details

**URL:** `ws://your-api-domain.com/location-tracking`  
**Namespace:** `/location-tracking`  
**Authentication:** JWT token required in connection payload

## 📤 Provider Events (SEND)

### Start Location Tracking

```typescript
socket.emit('start_tracking', {
  orderId: string,
  updateInterval?: number  // Optional, default: 30 seconds
})
```

### Update Location

```typescript
socket.emit('update_location', {
  latitude: number, // GPS latitude
  longitude: number, // GPS longitude
  accuracy: number, // GPS accuracy in meters
  orderId: string, // Order booking ID
});
```

### Stop Location Tracking

```typescript
socket.emit('stop_tracking', {
  orderId: string,
});
```

## 📥 User Events (RECEIVE)

### Provider Tracking Started

```typescript
socket.on('provider_tracking_started', (data) => {
  // data: { orderId, providerId, message }
});
```

### Provider Location Updated

```typescript
socket.on('provider_location_updated', (data) => {
  // data: { orderId, providerId, location: { latitude, longitude, accuracy, timestamp } }
});
```

### Provider Tracking Stopped

```typescript
socket.on('provider_tracking_stopped', (data) => {
  // data: { orderId, providerId, message }
});
```

## 📤 User Events (SEND)

### Start Order Tracking

```typescript
socket.emit('track_order', {
  orderId: string,
});
```

### Stop Order Tracking

```typescript
socket.emit('stop_tracking_order', {
  orderId: string,
});
```

## 📊 Data Structures

### Location Data

```typescript
interface LocationData {
  latitude: number; // GPS latitude
  longitude: number; // GPS longitude
  accuracy: number; // GPS accuracy in meters
  timestamp: Date; // Location timestamp
}
```

### Order Tracking Data

```typescript
interface OrderTrackingData {
  orderId: string; // Order booking ID
  providerId: number; // Provider user ID
  userId: number; // User ID
  isTracking: boolean; // Tracking status
  currentLocation?: LocationData;
}
```

## 🔐 Authentication

```typescript
// Connect with JWT token
const socket = io('ws://your-api-domain.com/location-tracking', {
  auth: { token: 'your_jwt_token_here' },
});
```

## ⚠️ Requirements

- **Order Status:** Must be `accepted` or `in_progress`
- **Permissions:** Users can only track their own orders
- **Permissions:** Providers can only track their assigned orders
- **JWT Token:** Must be valid and contain userId + role claims

## 🚀 Quick Start Example

```typescript
// 1. Connect
const socket = io('ws://your-api-domain.com/location-tracking', {
  auth: { token: jwtToken },
});

// 2. Provider: Start tracking
socket.emit('start_tracking', { orderId: 'order_123' });

// 3. Provider: Send location updates
socket.emit('update_location', {
  latitude: 25.2048,
  longitude: 55.2708,
  accuracy: 5.0,
  orderId: 'order_123',
});

// 4. User: Start listening
socket.emit('track_order', { orderId: 'order_123' });

// 5. User: Receive updates
socket.on('provider_location_updated', (data) => {
  console.log('Provider location:', data.location);
});
```

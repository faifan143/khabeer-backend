# 🧪 REST API Testing Guide for Location Tracking

## 🚀 **Your REST Endpoints Are Now Ready!**

The following endpoints are now available and working:

## 📡 **Available REST Endpoints**

### **1. Get Tracking Status**

```
GET {{baseUrl}}/location-tracking/order/{{orderId}}/tracking-status
```

**Headers:**

```
Authorization: Bearer {{jwt_token}}
```

**Response:**

```json
{
  "success": true,
  "orderId": "your_order_id",
  "isTracking": true,
  "hasLocationData": true,
  "currentLocation": {
    "latitude": 25.2048,
    "longitude": 55.2708,
    "accuracy": 5.0,
    "timestamp": "2024-01-15T10:30:00.000Z"
  },
  "providerId": 123,
  "orderStatus": "accepted",
  "lastUpdate": "2024-01-15T10:30:00.000Z",
  "message": "Order is being tracked"
}
```

### **2. Get Current Location**

```
GET {{baseUrl}}/location-tracking/order/{{orderId}}/current-location
```

**Response:**

```json
{
  "success": true,
  "orderId": "your_order_id",
  "location": {
    "latitude": 25.2048,
    "longitude": 55.2708,
    "accuracy": 5.0,
    "timestamp": "2024-01-15T10:30:00.000Z"
  },
  "isTracking": true,
  "providerId": 123
}
```

### **3. Get Location History**

```
GET {{baseUrl}}/location-tracking/order/{{orderId}}/location-history?limit=50
```

**Response:**

```json
{
  "success": true,
  "orderId": "your_order_id",
  "locations": [
    {
      "latitude": 25.2048,
      "longitude": 55.2708,
      "accuracy": 5.0,
      "timestamp": "2024-01-15T10:30:00.000Z"
    }
  ],
  "totalLocations": 1,
  "limit": 50
}
```

### **4. Get Estimated Arrival**

```
GET {{baseUrl}}/location-tracking/order/{{orderId}}/estimated-arrival
```

**Response:**

```json
{
  "success": true,
  "orderId": "your_order_id",
  "estimatedTimeMinutes": 15,
  "message": "Estimated arrival in 15 minutes"
}
```

## 🔧 **How to Test**

### **Step 1: Set Variables in Postman**

```
baseUrl: http://31.97.71.187:3000
jwt_token: your_actual_jwt_token
orderId: your_actual_order_booking_id
```

### **Step 2: Test Each Endpoint**

1. **Copy the URL** from above
2. **Set the Authorization header** with your JWT token
3. **Send the request**
4. **Check the response**

## ⚠️ **Common Issues & Solutions**

### **Issue 1: "Order not found"**

- **Solution:** Make sure you're using a valid `orderId` (booking ID)
- **Check:** Use your `/orders` endpoint to get valid order IDs

### **Issue 2: "Unauthorized"**

- **Solution:** Ensure your JWT token is valid and not expired
- **Get new token:** Use your login endpoint

### **Issue 3: "No location data available"**

- **Solution:** The provider hasn't started tracking yet
- **Fix:** Provider needs to start tracking via WebSocket first

## 🎯 **Testing Flow**

### **Complete Test Scenario:**

1. **Get a valid order ID** from your `/orders` endpoint
2. **Test tracking status** - should return `isTracking: false` initially
3. **Provider starts tracking** via WebSocket (if you have WebSocket setup)
4. **Test tracking status again** - should return `isTracking: true`
5. **Test current location** - should return provider's coordinates
6. **Test location history** - should return array of locations
7. **Test estimated arrival** - should return time estimate

## 🚀 **Quick Test in Postman**

### **Test Tracking Status:**

```
GET http://31.97.71.187:3000/location-tracking/order/YOUR_ORDER_ID/tracking-status
```

**Headers:**

```
Authorization: Bearer YOUR_JWT_TOKEN
```

## ✅ **Success Indicators**

When everything works correctly, you should see:

1. **200 OK responses** from all endpoints
2. **Proper JSON responses** with location data
3. **Real-time updates** when provider moves
4. **Accurate tracking status** based on WebSocket state

## 🔍 **Debugging Tips**

### **Check Backend Logs:**

- Look for "Order not found" messages
- Check if JWT token is being parsed correctly
- Verify order status is 'accepted' or 'in_progress'

### **Verify Data:**

- Confirm order exists in database
- Check if provider is assigned to order
- Ensure order status is correct

---

**Your REST endpoints are now fully functional! 🎉**

Test them with the guide above and let me know if you encounter any issues.

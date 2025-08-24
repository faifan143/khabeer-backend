# 🧪 Postman WebSocket Testing Guide

## 🚨 **Important Note**

Postman's WebSocket support can be tricky. The collection above is for reference, but here's the **correct way** to test your WebSocket system.

## 🔗 **Correct WebSocket URLs**

### **Base Connection URL:**

```
ws://31.97.71.187:3000/location-tracking
```

**NOT:** `ws://31.97.71.187.:3000/location-tracking` (no extra dot!)

## 📱 **Step-by-Step Testing**

### **Step 1: Connect to WebSocket**

1. **Open Postman**
2. **Create New Request**
3. **Select WebSocket Request**
4. **Enter URL:** `ws://31.97.71.187:3000/location-tracking`
5. **Click Connect**

### **Step 2: Set Authentication**

After connecting, you need to authenticate. The WebSocket connection should include your JWT token.

### **Step 3: Test Events**

#### **Provider Events (SEND):**

**Start Tracking:**

```json
{
  "event": "start_tracking",
  "data": {
    "orderId": "your_order_booking_id",
    "updateInterval": 30
  }
}
```

**Update Location:**

```json
{
  "event": "update_location",
  "data": {
    "latitude": 25.2048,
    "longitude": 55.2708,
    "accuracy": 5.0,
    "orderId": "your_order_booking_id"
  }
}
```

**Stop Tracking:**

```json
{
  "event": "stop_tracking",
  "data": {
    "orderId": "your_order_booking_id"
  }
}
```

#### **User Events (SEND):**

**Start Order Tracking:**

```json
{
  "event": "track_order",
  "data": {
    "orderId": "your_order_booking_id"
  }
}
```

**Stop Order Tracking:**

```json
{
  "event": "stop_tracking_order",
  "data": {
    "orderId": "your_order_booking_id"
  }
}
```

## 🎯 **Alternative: Use WebSocket Testing Tools**

Since Postman WebSocket can be problematic, use these alternatives:

### **1. WebSocket King (Chrome Extension)**

- Install from Chrome Web Store
- Connect to: `ws://31.97.71.187:3000/location-tracking`
- Send events directly

### **2. Simple WebSocket Client (Chrome Extension)**

- Simple and reliable
- Perfect for testing WebSocket APIs

### **3. wscat (Command Line)**

```bash
# Install wscat
npm install -g wscat

# Connect to WebSocket
wscat -c ws://31.97.71.187:3000/location-tracking

# Then send events
{"event": "start_tracking", "data": {"orderId": "test123"}}
```

## 🔧 **Testing Flow**

### **Complete Test Scenario:**

1. **Connect as Provider:**

   ```
   ws://31.97.71.187:3000/location-tracking
   ```

2. **Start Tracking:**

   ```json
   {
     "event": "start_tracking",
     "data": {
       "orderId": "test_order_123",
       "updateInterval": 30
     }
   }
   ```

3. **Update Location:**

   ```json
   {
     "event": "update_location",
     "data": {
       "latitude": 25.2048,
       "longitude": 55.2708,
       "accuracy": 5.0,
       "orderId": "test_order_123"
     }
   }
   ```

4. **Connect as User (in another tab):**

   ```
   ws://31.97.71.187:3000/location-tracking
   ```

5. **Start Listening:**

   ```json
   {
     "event": "track_order",
     "data": {
       "orderId": "test_order_123"
     }
   }
   ```

6. **You should receive location updates in real-time!**

## ⚠️ **Common Issues & Solutions**

### **Issue 1: "Invalid protocol: ws:"**

- **Solution:** Remove extra dots from IP address
- **Correct:** `ws://31.97.71.187:3000/location-tracking`

### **Issue 2: Connection refused**

- **Solution:** Check if your backend is running on port 3000
- **Check:** `http://31.97.71.187:3000/health` (if you have a health endpoint)

### **Issue 3: Authentication failed**

- **Solution:** Ensure your JWT token is valid and not expired
- **Get new token:** Use your login endpoint

### **Issue 4: Order not found**

- **Solution:** Use a valid order ID from your database
- **Check:** Use your `/orders` endpoint to get valid order IDs

## 🎉 **Success Indicators**

When everything works correctly, you should see:

1. **WebSocket connection established**
2. **Events sent successfully**
3. **Real-time responses from the server**
4. **Location updates flowing between provider and user**

## 📞 **Need Help?**

If you're still having issues:

1. **Check your backend logs** for connection attempts
2. **Verify the server is running** on the correct port
3. **Test with a simple WebSocket client** first
4. **Check firewall settings** on your server

---

**Happy testing! 🚀**

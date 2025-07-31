# Postman Flows Tutorial - Khabeer Backend

## 🎯 **Complete User Journey Tutorials**

This guide provides step-by-step Postman flows for all major scenarios in the Khabeer service marketplace backend.

---

## 📋 **Table of Contents**

1. [🔐 Authentication Flows](#-authentication-flows)
2. [👨‍💼 Admin Management Flows](#-admin-management-flows)
3. [👤 User Journey Flows](#-user-journey-flows)
4. [🔧 Provider Journey Flows](#-provider-journey-flows)
5. [📦 Complete Order Flows](#-complete-order-flows)
6. [💰 Payment Processing Flows](#-payment-processing-flows)
7. [⭐ Rating & Review Flows](#-rating--review-flows)
8. [🎁 Offers & Promotions Flows](#-offers--promotions-flows)
9. [🔍 Search & Discovery Flows](#-search--discovery-flows)
10. [📁 File Management Flows](#-file-management-flows)

---

## 🔐 **Authentication Flows**

### **Flow 1: User Registration & Login**

#### **Step 1: Register New User**
```bash
POST {{baseUrl}}/auth/register
Content-Type: multipart/form-data

Form Data:
- name: "John Doe"
- email: "john@example.com"
- password: "user123"
- role: "USER"
- phone: "1234567890"
- address: "123 Main St"
- state: "California"
```

#### **Step 2: Login User**
```bash
POST {{baseUrl}}/auth/login
Content-Type: application/json

Body:
{
  "email": "john@example.com",
  "password": "user123"
}
```

**Expected Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "USER"
  }
}
```

### **Flow 2: Provider Registration & Login**

#### **Step 1: Register New Provider**
```bash
POST {{baseUrl}}/auth/register
Content-Type: multipart/form-data

Form Data:
- name: "Clean Pro Services"
- email: "provider@cleanpro.com"
- password: "provider123"
- role: "PROVIDER"
- phone: "9876543210"
- state: "California"
- description: "Professional cleaning services"
```

#### **Step 2: Login Provider**
```bash
POST {{baseUrl}}/auth/login
Content-Type: application/json

Body:
{
  "email": "provider@cleanpro.com",
  "password": "provider123"
}
```

### **Flow 3: Admin Login**
```bash
POST {{baseUrl}}/auth/login
Content-Type: application/json

Body:
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

---

## 👨‍💼 **Admin Management Flows**

### **Flow 4: Admin Dashboard Overview**

#### **Step 1: Get Dashboard Stats**
```bash
GET {{baseUrl}}/admin/dashboard
Authorization: Bearer {{adminToken}}
```

#### **Step 2: Get All Users**
```bash
GET {{baseUrl}}/admin/users
Authorization: Bearer {{adminToken}}
```

#### **Step 3: Get All Providers**
```bash
GET {{baseUrl}}/admin/providers
Authorization: Bearer {{adminToken}}
```

#### **Step 4: Get Unverified Providers**
```bash
GET {{baseUrl}}/admin/providers/unverified
Authorization: Bearer {{adminToken}}
```

### **Flow 5: Provider Verification Process**

#### **Step 1: Verify Provider**
```bash
PUT {{baseUrl}}/admin/providers/1/verify
Authorization: Bearer {{adminToken}}
Content-Type: application/json

Body: {}
```

#### **Step 2: Set Provider Active**
```bash
PUT {{baseUrl}}/providers/1/status
Authorization: Bearer {{adminToken}}
Content-Type: application/json

Body:
{
  "isActive": true
}
```

#### **Step 3: Unverify Provider (if needed)**
```bash
PUT {{baseUrl}}/admin/providers/1/unverify
Authorization: Bearer {{adminToken}}
Content-Type: application/json

Body: {}
```

---

## 👤 **User Journey Flows**

### **Flow 6: User Service Discovery**

#### **Step 1: Browse Categories**
```bash
GET {{baseUrl}}/categories
```

#### **Step 2: Search Services**
```bash
GET {{baseUrl}}/search/services?q=cleaning&categoryId=1&minPrice=50&maxPrice=200
```

#### **Step 3: Get Trending Services**
```bash
GET {{baseUrl}}/search/trending
```

#### **Step 4: Search Providers**
```bash
GET {{baseUrl}}/search/providers?q=cleaning&isVerified=true&minRating=4
```

### **Flow 7: User Order Creation**

#### **Step 1: Create Order (with automatic offer application)**
```bash
POST {{baseUrl}}/orders
Authorization: Bearer {{userToken}}
Content-Type: application/json

Body:
{
  "providerId": 5,
  "serviceId": 2,
  "scheduledDate": "2024-12-25T10:00:00Z",
  "location": "Home",
  "locationDetails": "123 Main St, Apartment 4B",
  "quantity": 1,
  "providerLocation": {
    "lat": 40.7128,
    "lng": -74.0060
  }
}
```

**Expected Response (with offer applied):**
```json
{
  "id": 8,
  "userId": 1,
  "providerId": 5,
  "serviceId": 2,
  "totalAmount": 85.00,
  "providerAmount": 80.00,
  "commissionAmount": 5.00,
  "status": "PENDING",
  "appliedOffer": {
    "id": 1,
    "title": "20% off cleaning services",
    "originalPrice": 100.00,
    "offerPrice": 80.00,
    "discount": 20.00,
    "savings": 20.00
  },
  "invoice": {
    "id": 8,
    "totalAmount": 85.00,
    "discount": 20.00,
    "paymentStatus": "pending"
  }
}
```

#### **Step 2: View User Orders**
```bash
GET {{baseUrl}}/orders
Authorization: Bearer {{userToken}}
```

#### **Step 3: Get Order History**
```bash
GET {{baseUrl}}/orders/history?page=1&limit=10
Authorization: Bearer {{userToken}}
```

---

## 🔧 **Provider Journey Flows**

### **Flow 8: Provider Setup & Services**

#### **Step 1: Add Services to Provider**
```bash
POST {{baseUrl}}/provider-service/add
Authorization: Bearer {{providerToken}}
Content-Type: application/json

Body:
{
  "serviceIds": [1, 2, 3]
}
```

#### **Step 2: Get Provider Services**
```bash
GET {{baseUrl}}/provider-service
Authorization: Bearer {{providerToken}}
```

#### **Step 3: Update Service Price**
```bash
PUT {{baseUrl}}/provider-service/1
Authorization: Bearer {{providerToken}}
Content-Type: application/json

Body:
{
  "price": 150.00
}
```

#### **Step 4: Toggle Service Status**
```bash
PUT {{baseUrl}}/provider-service/1/toggle
Authorization: Bearer {{providerToken}}
```

### **Flow 9: Provider Status Management**

#### **Step 1: Get Provider Status**
```bash
GET {{baseUrl}}/providers/1/status
Authorization: Bearer {{providerToken}}
```

#### **Step 2: Set Provider Active**
```bash
PUT {{baseUrl}}/providers/1/status
Authorization: Bearer {{providerToken}}
Content-Type: application/json

Body:
{
  "isActive": true
}
```

#### **Step 3: Set Provider Inactive**
```bash
PUT {{baseUrl}}/providers/1/status
Authorization: Bearer {{providerToken}}
Content-Type: application/json

Body:
{
  "isActive": false
}
```

### **Flow 10: Provider Order Management**

#### **Step 1: Get Provider Orders**
```bash
GET {{baseUrl}}/orders
Authorization: Bearer {{providerToken}}
```

#### **Step 2: Accept Order**
```bash
PUT {{baseUrl}}/orders/1/accept
Authorization: Bearer {{providerToken}}
Content-Type: application/json

Body: {}
```

#### **Step 3: Start Order**
```bash
PUT {{baseUrl}}/orders/1/start
Authorization: Bearer {{providerToken}}
Content-Type: application/json

Body: {}
```

#### **Step 4: Complete Order**
```bash
PUT {{baseUrl}}/orders/1/complete
Authorization: Bearer {{providerToken}}
Content-Type: application/json

Body: {}
```

#### **Step 5: Get Order Analytics**
```bash
GET {{baseUrl}}/orders/analytics
Authorization: Bearer {{providerToken}}
```

---

## 📦 **Complete Order Flows**

### **Flow 11: End-to-End Order Process**

#### **Phase 1: Order Creation (User)**
```bash
POST {{baseUrl}}/orders
Authorization: Bearer {{userToken}}
Content-Type: application/json

Body:
{
  "providerId": 5,
  "serviceId": 2,
  "scheduledDate": "2024-12-25T10:00:00Z",
  "location": "Home",
  "locationDetails": "123 Main St, Apartment 4B",
  "quantity": 1,
  "providerLocation": {
    "lat": 40.7128,
    "lng": -74.0060
  }
}
```

#### **Phase 2: Order Acceptance (Provider)**
```bash
PUT {{baseUrl}}/orders/1/accept
Authorization: Bearer {{providerToken}}
Content-Type: application/json

Body: {}
```

#### **Phase 3: Order Execution (Provider)**
```bash
PUT {{baseUrl}}/orders/1/start
Authorization: Bearer {{providerToken}}
Content-Type: application/json

Body: {}
```

#### **Phase 4: Order Completion (Provider)**
```bash
PUT {{baseUrl}}/orders/1/complete
Authorization: Bearer {{providerToken}}
Content-Type: application/json

Body: {}
```

#### **Phase 5: Payment Processing (User)**
```bash
PUT {{baseUrl}}/invoices/1/mark-paid
Authorization: Bearer {{userToken}}
Content-Type: application/json

Body:
{
  "paymentMethod": "cash"
}
```

#### **Phase 6: Payment Confirmation (Provider)**
```bash
PUT {{baseUrl}}/invoices/1/confirm-payment
Authorization: Bearer {{providerToken}}
```

#### **Phase 7: Rating (User)**
```bash
POST {{baseUrl}}/provider-ratings
Authorization: Bearer {{userToken}}
Content-Type: application/json

Body:
{
  "providerId": 5,
  "orderId": 1,
  "rating": 5,
  "comment": "Excellent service!"
}
```

---

## 💰 **Payment Processing Flows**

### **Flow 12: Invoice Management**

#### **Step 1: Get User Invoices**
```bash
GET {{baseUrl}}/invoices
Authorization: Bearer {{userToken}}
```

#### **Step 2: Get Provider Invoices**
```bash
GET {{baseUrl}}/invoices
Authorization: Bearer {{providerToken}}
```

#### **Step 3: Mark Invoice as Paid**
```bash
PUT {{baseUrl}}/invoices/1/mark-paid
Authorization: Bearer {{userToken}}
Content-Type: application/json

Body:
{
  "paymentMethod": "cash"
}
```

#### **Step 4: Confirm Payment**
```bash
PUT {{baseUrl}}/invoices/1/confirm-payment
Authorization: Bearer {{providerToken}}
```

#### **Step 5: Get Pending Confirmations**
```bash
GET {{baseUrl}}/invoices/pending-confirmations
Authorization: Bearer {{providerToken}}
```

### **Flow 13: Payment Status Updates**

#### **Step 1: Update Payment Status**
```bash
PUT {{baseUrl}}/invoices/1/payment-status
Authorization: Bearer {{userToken}}
Content-Type: application/json

Body:
{
  "paymentStatus": "paid",
  "paymentMethod": "card"
}
```

#### **Step 2: Mark Invoice as Failed**
```bash
PUT {{baseUrl}}/invoices/1/mark-failed
Authorization: Bearer {{userToken}}
Content-Type: application/json

Body: {}
```

#### **Step 3: Refund Invoice**
```bash
PUT {{baseUrl}}/invoices/1/refund
Authorization: Bearer {{userToken}}
Content-Type: application/json

Body: {}
```

---

## ⭐ **Rating & Review Flows**

### **Flow 14: Complete Rating Process**

#### **Step 1: Rate Provider**
```bash
POST {{baseUrl}}/provider-ratings
Authorization: Bearer {{userToken}}
Content-Type: application/json

Body:
{
  "providerId": 5,
  "orderId": 7,
  "rating": 5,
  "comment": "Excellent service!"
}
```

#### **Step 2: Get All Ratings**
```bash
GET {{baseUrl}}/provider-ratings
```

#### **Step 3: Get Provider Ratings**
```bash
GET {{baseUrl}}/provider-ratings/provider/5
```

#### **Step 4: Get Top Rated Providers**
```bash
GET {{baseUrl}}/provider-ratings/top-rated
```

#### **Step 5: Get My Ratings (User)**
```bash
GET {{baseUrl}}/provider-ratings/my-ratings
Authorization: Bearer {{userToken}}
```

#### **Step 6: Update Rating**
```bash
PUT {{baseUrl}}/provider-ratings/1
Authorization: Bearer {{userToken}}
Content-Type: application/json

Body:
{
  "rating": 4,
  "comment": "Updated review - very good service!"
}
```

#### **Step 7: Delete Rating**
```bash
DELETE {{baseUrl}}/provider-ratings/1
Authorization: Bearer {{userToken}}
```

---

## 🎁 **Offers & Promotions Flows**

### **Flow 15: Complete Offers Management**

#### **Step 1: Create Offer (Provider)**
```bash
POST {{baseUrl}}/offers
Authorization: Bearer {{providerToken}}
Content-Type: application/json

Body:
{
  "serviceId": 2,
  "title": "Summer Discount",
  "description": "20% off cleaning services",
  "originalPrice": 100.00,
  "offerPrice": 80.00,
  "startDate": "2024-01-01T00:00:00Z",
  "endDate": "2024-12-31T23:59:59Z"
}
```

#### **Step 2: Get Active Offers**
```bash
GET {{baseUrl}}/offers/active
```

#### **Step 3: Get Provider Offers**
```bash
GET {{baseUrl}}/offers/provider/5
```

#### **Step 4: Get My Offers (Provider)**
```bash
GET {{baseUrl}}/offers/my-offers
Authorization: Bearer {{providerToken}}
```

#### **Step 5: Get Offer Details**
```bash
GET {{baseUrl}}/offers/1
```

#### **Step 6: Update Offer**
```bash
PUT {{baseUrl}}/offers/1
Authorization: Bearer {{providerToken}}
Content-Type: application/json

Body:
{
  "title": "Updated Summer Discount",
  "description": "25% off cleaning services",
  "offerPrice": 75.00
}
```

#### **Step 7: Delete Offer**
```bash
DELETE {{baseUrl}}/offers/1
Authorization: Bearer {{providerToken}}
```

### **Flow 16: Automatic Offer Application**

#### **Step 1: Create Order (Offer automatically applied)**
```bash
POST {{baseUrl}}/orders
Authorization: Bearer {{userToken}}
Content-Type: application/json

Body:
{
  "providerId": 5,
  "serviceId": 2,
  "scheduledDate": "2024-12-25T10:00:00Z",
  "location": "Home",
  "locationDetails": "123 Main St, Apartment 4B",
  "quantity": 1,
  "providerLocation": {
    "lat": 40.7128,
    "lng": -74.0060
  }
}
```

**Response shows applied offer:**
```json
{
  "appliedOffer": {
    "id": 1,
    "title": "20% off cleaning services",
    "originalPrice": 100.00,
    "offerPrice": 80.00,
    "discount": 20.00,
    "savings": 20.00
  }
}
```

---

## 🔍 **Search & Discovery Flows**

### **Flow 17: Advanced Search**

#### **Step 1: Search Services**
```bash
GET {{baseUrl}}/search/services?q=cleaning&categoryId=1&minPrice=50&maxPrice=200
```

#### **Step 2: Search Services Paginated**
```bash
GET {{baseUrl}}/search/services/paginated?q=cleaning&page=1&limit=10
```

#### **Step 3: Search Providers**
```bash
GET {{baseUrl}}/search/providers?q=cleaning&isVerified=true&minRating=4
```

#### **Step 4: Get Trending Services**
```bash
GET {{baseUrl}}/search/trending
```

#### **Step 5: Get Search Suggestions**
```bash
GET {{baseUrl}}/search/suggestions?q=cle
```

### **Flow 18: Category & Service Discovery**

#### **Step 1: Get All Categories**
```bash
GET {{baseUrl}}/categories
```

#### **Step 2: Get Services by Category**
```bash
GET {{baseUrl}}/services/category/1
```

#### **Step 3: Get All Services**
```bash
GET {{baseUrl}}/services
```

---

## 📁 **File Management Flows**

### **Flow 19: File Upload & Management**

#### **Step 1: Upload Single File**
```bash
POST {{baseUrl}}/files/upload
Authorization: Bearer {{providerToken}}
Content-Type: multipart/form-data

Form Data:
- file: [Select file]
```

#### **Step 2: Upload Multiple Files**
```bash
POST {{baseUrl}}/files/upload-multiple
Authorization: Bearer {{providerToken}}
Content-Type: multipart/form-data

Form Data:
- files: [Select multiple files]
```

#### **Step 3: Upload Documents**
```bash
POST {{baseUrl}}/files/upload-documents
Authorization: Bearer {{providerToken}}
Content-Type: multipart/form-data

Form Data:
- documents: [Select document files]
```

#### **Step 4: Get File Info**
```bash
GET {{baseUrl}}/files/info/filename.jpg
```

#### **Step 5: Delete File**
```bash
DELETE {{baseUrl}}/files/filename.jpg
Authorization: Bearer {{providerToken}}
```

---

## 🎯 **Advanced Scenarios**

### **Flow 20: Bulk Operations**

#### **Step 1: Bulk Update Orders**
```bash
PUT {{baseUrl}}/orders/bulk-update
Authorization: Bearer {{providerToken}}
Content-Type: application/json

Body:
{
  "orderIds": [1, 2, 3],
  "status": "completed"
}
```

### **Flow 21: Order Status Management**

#### **Step 1: Update Order Status**
```bash
PUT {{baseUrl}}/orders/1/status
Authorization: Bearer {{providerToken}}
Content-Type: application/json

Body:
{
  "status": "accepted"
}
```

#### **Step 2: Get Orders by Status**
```bash
GET {{baseUrl}}/orders/status/accepted
Authorization: Bearer {{providerToken}}
```

#### **Step 3: Get Upcoming Orders**
```bash
GET {{baseUrl}}/orders/upcoming
Authorization: Bearer {{providerToken}}
```

#### **Step 4: Cancel Order**
```bash
PUT {{baseUrl}}/orders/1/cancel
Authorization: Bearer {{userToken}}
Content-Type: application/json

Body: {}
```

---

## 🚀 **Testing Tips**

### **Environment Variables Setup:**
1. Set `baseUrl` to your server URL
2. Use `{{userToken}}`, `{{providerToken}}`, `{{adminToken}}` for authentication
3. Update IDs in URLs based on your test data

### **Test Data Preparation:**
1. Create test users, providers, and services first
2. Use consistent IDs across related requests
3. Test with both valid and invalid data

### **Error Handling:**
- Check response status codes
- Verify error messages
- Test authorization failures
- Validate data constraints

### **Performance Testing:**
- Test with large datasets
- Monitor response times
- Check pagination limits
- Verify search performance

---

## 📊 **Success Criteria**

### **✅ Authentication:**
- All login/register flows work
- Tokens are properly generated
- Role-based access is enforced

### **✅ Order Management:**
- Orders can be created, updated, and completed
- Status transitions work correctly
- Automatic offer application functions

### **✅ Payment Processing:**
- Invoices are created automatically
- Payment status updates work
- Provider confirmation flow functions

### **✅ Rating System:**
- Users can rate providers
- Ratings are properly stored and retrieved
- Top-rated providers are calculated

### **✅ Offers System:**
- Providers can create and manage offers
- Offers are automatically applied to orders
- Offer validation works correctly

### **✅ Search & Discovery:**
- Search returns relevant results
- Filtering works as expected
- Pagination functions properly

---

## 🎉 **Ready to Test!**

**All flows are now documented and ready for testing!**

- ✅ **21 complete flows** covering all scenarios
- ✅ **Step-by-step instructions** for each flow
- ✅ **Expected responses** and validation criteria
- ✅ **Error handling** and testing tips
- ✅ **Success criteria** for each flow

**Start with the authentication flows and work your way through each scenario!** 🚀 
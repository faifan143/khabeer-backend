#!/usr/bin/env node

/**
 * Location Tracking Test Script
 *
 * This script helps test the fixed location tracking system
 * Run with: node test-location-tracking.js
 */

const io = require('socket.io-client');

// Configuration
const BASE_URL = 'http://localhost:3000';
const NAMESPACE = '/location-tracking';

// Test data - replace with actual values from your system
const TEST_DATA = {
  // Provider JWT token (get this by logging in as a provider)
  providerToken: 'YOUR_PROVIDER_JWT_TOKEN_HERE',

  // User JWT token (get this by logging in as a user)
  userToken: 'YOUR_USER_JWT_TOKEN_HERE',

  // Test order ID (must exist and be assigned to the provider)
  testOrderId: '123',
};

console.log('🚀 Location Tracking Test Script');
console.log('================================');
console.log(`Base URL: ${BASE_URL}`);
console.log(`Namespace: ${NAMESPACE}`);
console.log('');

// Test 1: Provider Connection
async function testProviderConnection() {
  console.log('🧪 Test 1: Provider Connection');
  console.log('--------------------------------');

  if (TEST_DATA.providerToken === 'YOUR_PROVIDER_JWT_TOKEN_HERE') {
    console.log(
      '❌ Please set a valid provider JWT token in TEST_DATA.providerToken',
    );
    return false;
  }

  return new Promise((resolve) => {
    const socket = io(`${BASE_URL}${NAMESPACE}`, {
      auth: {
        token: TEST_DATA.providerToken,
      },
    });

    socket.on('connect', () => {
      console.log('✅ Provider connected successfully');
      console.log(`   Socket ID: ${socket.id}`);
    });

    socket.on('connected', (data) => {
      console.log('✅ Provider authenticated successfully');
      console.log(`   User ID: ${data.userId}`);
      console.log(`   User Role: ${data.userRole}`);
      console.log(`   User Email: ${data.userEmail}`);

      // Test socket status
      socket.emit('get_socket_status');
    });

    socket.on('socket_status', (status) => {
      console.log('✅ Socket status received');
      console.log(`   Provider Sockets Count: ${status.providerSocketsCount}`);
      console.log(`   User Sockets Count: ${status.userSocketsCount}`);

      // Test start tracking
      console.log(
        `   Attempting to start tracking for order ${TEST_DATA.testOrderId}`,
      );
      socket.emit('start_tracking', {
        orderId: TEST_DATA.testOrderId,
      });
    });

    socket.on('tracking_started', (data) => {
      console.log('✅ Tracking started successfully');
      console.log(`   Order ID: ${data.orderId}`);
      console.log(`   Message: ${data.message}`);

      // Test location update
      console.log('   Testing location update...');
      socket.emit('update_location', {
        latitude: 25.2048,
        longitude: 55.2708,
        accuracy: 5.0,
        orderId: TEST_DATA.testOrderId,
      });
    });

    socket.on('location_updated', (data) => {
      console.log('✅ Location updated successfully');
      console.log(`   Location ID: ${data.locationId}`);
      console.log(`   Timestamp: ${data.timestamp}`);

      // Test stop tracking
      console.log('   Testing stop tracking...');
      socket.emit('stop_tracking', {
        orderId: TEST_DATA.testOrderId,
      });
    });

    socket.on('tracking_stopped', (data) => {
      console.log('✅ Tracking stopped successfully');
      console.log(`   Order ID: ${data.orderId}`);
      console.log(`   Message: ${data.message}`);

      socket.disconnect();
      resolve(true);
    });

    socket.on('error', (error) => {
      console.error('❌ Provider error:', error.message);
      socket.disconnect();
      resolve(false);
    });

    socket.on('disconnect', () => {
      console.log('🔌 Provider disconnected');
    });

    // Timeout after 10 seconds
    setTimeout(() => {
      console.log('⏰ Provider test timeout');
      socket.disconnect();
      resolve(false);
    }, 10000);
  });
}

// Test 2: User Connection
async function testUserConnection() {
  console.log('\n🧪 Test 2: User Connection');
  console.log('----------------------------');

  if (TEST_DATA.userToken === 'YOUR_USER_JWT_TOKEN_HERE') {
    console.log('❌ Please set a valid user JWT token in TEST_DATA.userToken');
    return false;
  }

  return new Promise((resolve) => {
    const socket = io(`${BASE_URL}${NAMESPACE}`, {
      auth: {
        token: TEST_DATA.userToken,
      },
    });

    socket.on('connect', () => {
      console.log('✅ User connected successfully');
      console.log(`   Socket ID: ${socket.id}`);
    });

    socket.on('connected', (data) => {
      console.log('✅ User authenticated successfully');
      console.log(`   User ID: ${data.userId}`);
      console.log(`   User Role: ${data.userRole}`);
      console.log(`   User Email: ${data.userEmail}`);

      // Test socket status
      socket.emit('get_socket_status');
    });

    socket.on('socket_status', (status) => {
      console.log('✅ Socket status received');
      console.log(`   Provider Sockets Count: ${status.providerSocketsCount}`);
      console.log(`   User Sockets Count: ${status.userSocketsCount}`);

      // Test order tracking
      console.log(`   Attempting to track order ${TEST_DATA.testOrderId}`);
      socket.emit('track_order', {
        orderId: TEST_DATA.testOrderId,
      });
    });

    socket.on('order_tracking_started', (data) => {
      console.log('✅ Order tracking started successfully');
      console.log(`   Order ID: ${data.orderId}`);
      console.log(`   Is Tracking: ${data.isTracking}`);
      console.log(`   Provider ID: ${data.providerId}`);
      console.log(`   Message: ${data.message}`);

      // Test stop tracking
      console.log('   Testing stop order tracking...');
      socket.emit('stop_tracking_order', {
        orderId: TEST_DATA.testOrderId,
      });
    });

    socket.on('order_tracking_stopped', (data) => {
      console.log('✅ Order tracking stopped successfully');
      console.log(`   Order ID: ${data.orderId}`);
      console.log(`   Message: ${data.message}`);

      socket.disconnect();
      resolve(true);
    });

    socket.on('error', (error) => {
      console.error('❌ User error:', error.message);
      socket.disconnect();
      resolve(false);
    });

    socket.on('disconnect', () => {
      console.log('🔌 User disconnected');
    });

    // Timeout after 10 seconds
    setTimeout(() => {
      console.log('⏰ User test timeout');
      socket.disconnect();
      resolve(false);
    }, 10000);
  });
}

// Test 3: HTTP Endpoints
async function testHttpEndpoints() {
  console.log('\n🧪 Test 3: HTTP Endpoints');
  console.log('----------------------------');

  try {
    // Test health endpoint
    const healthResponse = await fetch(
      `${BASE_URL}/api/location-tracking/health`,
    );
    const healthData = await healthResponse.json();

    if (healthResponse.ok) {
      console.log('✅ Health endpoint working');
      console.log(`   Status: ${healthData.status}`);
      console.log(
        `   Active Tracking Count: ${healthData.activeTrackingCount}`,
      );
    } else {
      console.log('❌ Health endpoint failed:', healthData.message);
    }
  } catch (error) {
    console.error('❌ HTTP test failed:', error.message);
  }
}

// Main test runner
async function runTests() {
  console.log('Starting location tracking tests...\n');

  try {
    // Test provider functionality
    const providerSuccess = await testProviderConnection();

    // Wait a bit between tests
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Test user functionality
    const userSuccess = await testUserConnection();

    // Wait a bit between tests
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Test HTTP endpoints
    await testHttpEndpoints();

    // Summary
    console.log('\n📊 Test Summary');
    console.log('================');
    console.log(
      `Provider Tests: ${providerSuccess ? '✅ PASSED' : '❌ FAILED'}`,
    );
    console.log(`User Tests: ${userSuccess ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`HTTP Tests: ✅ COMPLETED`);

    if (providerSuccess && userSuccess) {
      console.log(
        '\n🎉 All tests passed! Location tracking is working correctly.',
      );
    } else {
      console.log('\n⚠️  Some tests failed. Check the logs above for details.');
    }
  } catch (error) {
    console.error('\n💥 Test execution failed:', error.message);
  }

  console.log('\n🏁 Tests completed');
}

// Instructions
console.log('📋 Setup Instructions:');
console.log('1. Make sure your backend server is running on port 3000');
console.log('2. Get valid JWT tokens for a provider and user account');
console.log('3. Update TEST_DATA in this script with your tokens and order ID');
console.log('4. Run: node test-location-tracking.js');
console.log('');

// Check if running directly
if (require.main === module) {
  // Check if tokens are set
  if (
    TEST_DATA.providerToken === 'YOUR_PROVIDER_JWT_TOKEN_HERE' ||
    TEST_DATA.userToken === 'YOUR_USER_JWT_TOKEN_HERE'
  ) {
    console.log(
      '❌ Please update TEST_DATA with valid JWT tokens before running tests',
    );
    console.log(
      '   You can get tokens by logging in through your auth endpoints',
    );
    process.exit(1);
  }

  runTests();
}

module.exports = { runTests, testProviderConnection, testUserConnection };

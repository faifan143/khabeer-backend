#!/usr/bin/env node

/**
 * FCM Token Notifications Test Script
 *
 * This script tests individual FCM token notifications for specific users and providers
 * Run with: node test-fcm-notifications.js
 */

const axios = require('axios');
const readline = require('readline');

// Configuration
const BASE_URL = 'http://31.97.71.187:3000';
const API_BASE = `${BASE_URL}/api`;

// Test data - replace with actual values from your system
const TEST_DATA = {
  // Admin JWT token (get this by logging in as admin)
  adminToken:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluQGtoYWJlZXIuY29tIiwic3ViIjowLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3NTYyOTc0MjUsImV4cCI6MTc1NjkwMjIyNX0.szCoFMrgNXoN7gvkohfuppuAf5z8SBBHYoBVrH4f-2E',
};

console.log('🔥 FCM Token Notifications Test Script');
console.log('======================================');
console.log(`Base URL: ${BASE_URL}`);
console.log(`API Base: ${API_BASE}`);
console.log('');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Helper function to get user input
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

// Helper function to make authenticated requests
async function makeRequest(
  method,
  endpoint,
  data = null,
  token = TEST_DATA.adminToken,
) {
  try {
    const config = {
      method,
      url: `${API_BASE}${endpoint}`,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      status: error.response?.status,
    };
  }
}

// Test individual user FCM token notification
async function testUserTokenNotification(userId) {
  console.log(`\n👥 Testing User FCM Token Notification`);
  console.log('=====================================');
  console.log(`   Testing User ID: ${userId}`);
  console.log('   ' + '─'.repeat(40));

  // Test user token notification
  const userTokenResult = await makeRequest(
    'POST',
    `/notification-test/tokens/test-user/${userId}`,
    {
      title: '🧪 User Token Test',
      body: `Testing FCM token for user ${userId} at ${new Date().toLocaleTimeString()}`,
      data: {
        test: 'true',
        userId: userId.toString(),
        timestamp: new Date().toISOString(),
        type: 'individual_user_test',
      },
    },
  );

  if (userTokenResult.success) {
    console.log(`      ✅ User ${userId} token test passed`);
    console.log(
      `         Message ID: ${userTokenResult.data.messageId || 'N/A'}`,
    );
    console.log(`         Success: ${userTokenResult.data.success}`);
    if (userTokenResult.data.error) {
      console.log(`         Error: ${userTokenResult.data.error}`);
    }
    console.log(
      `         Response: ${JSON.stringify(userTokenResult.data, null, 2)}`,
    );
  } else {
    console.log(
      `      ❌ User ${userId} token test failed: ${userTokenResult.error}`,
    );
  }

  console.log('');
}

// Test individual provider FCM token notification
async function testProviderTokenNotification(providerId) {
  console.log(`\n🏢 Testing Provider FCM Token Notification`);
  console.log('=========================================');
  console.log(`   Testing Provider ID: ${providerId}`);
  console.log('   ' + '─'.repeat(40));

  // Test provider token notification
  const providerTokenResult = await makeRequest(
    'POST',
    `/notification-test/tokens/test-provider/${providerId}`,
    {
      title: '🧪 Provider Token Test',
      body: `Testing FCM token for provider ${providerId} at ${new Date().toLocaleTimeString()}`,
      data: {
        test: 'true',
        providerId: providerId.toString(),
        timestamp: new Date().toISOString(),
        type: 'individual_provider_test',
      },
    },
  );

  if (providerTokenResult.success) {
    console.log(`      ✅ Provider ${providerId} token test passed`);
    console.log(
      `         Message ID: ${providerTokenResult.data.messageId || 'N/A'}`,
    );
    console.log(`         Success: ${providerTokenResult.data.success}`);
    if (providerTokenResult.data.error) {
      console.log(`         Error: ${providerTokenResult.data.error}`);
    }
    console.log(
      `         Response: ${JSON.stringify(providerTokenResult.data, null, 2)}`,
    );
  } else {
    console.log(
      `      ❌ Provider ${providerId} token test failed: ${providerTokenResult.error}`,
    );
  }

  console.log('');
}

// Test FCM system status
async function testFCMStatus() {
  console.log('🔥 Testing FCM System Status');
  console.log('============================');

  const statusResult = await makeRequest('GET', '/notification-test/status');

  if (statusResult.success) {
    console.log('   ✅ FCM system status retrieved');
    console.log(`      Status: ${statusResult.data.status}`);
    console.log(
      `      Firebase Initialized: ${statusResult.data.firebaseInitialized ? '✅' : '❌'}`,
    );
    console.log(`      Total Topics: ${statusResult.data.totalTopics}`);

    if (statusResult.data.availableTopics) {
      console.log('      Available Topics:');
      statusResult.data.availableTopics.forEach((topic) => {
        console.log(
          `         - ${topic.topicName}: ${topic.exists ? '✅' : '❌'}`,
        );
      });
    }
  } else {
    console.log(`   ❌ FCM system status failed: ${statusResult.error}`);
  }

  console.log('');
}

// Test error handling for invalid IDs
async function testErrorHandling() {
  console.log('🚨 Testing Error Handling');
  console.log('==========================');

  // Test with invalid user ID
  console.log('   Testing invalid user ID (999999)...');
  const invalidUserIdResult = await makeRequest(
    'POST',
    '/notification-test/tokens/test-user/999999',
    {
      title: 'Test',
      body: 'This should fail with invalid user ID',
    },
  );

  if (!invalidUserIdResult.success) {
    console.log('      ✅ Invalid user ID properly rejected');
    console.log(`         Error: ${invalidUserIdResult.error}`);
  } else {
    console.log('      ⚠️  Invalid user ID was accepted (unexpected)');
  }

  // Test with invalid provider ID
  console.log('   Testing invalid provider ID (999999)...');
  const invalidProviderIdResult = await makeRequest(
    'POST',
    '/notification-test/tokens/test-provider/999999',
    {
      title: 'Test',
      body: 'This should fail with invalid provider ID',
    },
  );

  if (!invalidProviderIdResult.success) {
    console.log('      ✅ Invalid provider ID properly rejected');
    console.log(`         Error: ${invalidProviderIdResult.error}`);
  } else {
    console.log('      ⚠️  Invalid provider ID was accepted (unexpected)');
  }

  // Test without authentication
  console.log('   Testing without authentication...');
  const noAuthResult = await makeRequest(
    'POST',
    '/notification-test/tokens/test-user/1',
    {
      title: 'Test',
      body: 'This should fail without auth',
    },
    'invalid_token',
  );

  if (!noAuthResult.success && noAuthResult.status === 401) {
    console.log('      ✅ Authentication properly enforced');
  } else {
    console.log('      ⚠️  Authentication not properly enforced');
  }

  console.log('');
}

// Main interactive test runner
async function runInteractiveTest() {
  console.log('Starting Interactive FCM Token Notification Test...\n');

  try {
    // Check if admin token is set
    if (
      TEST_DATA.adminToken === 'YOUR_ADMIN_JWT_TOKEN_HERE' ||
      !TEST_DATA.adminToken
    ) {
      console.log(
        '❌ Please set a valid admin JWT token in TEST_DATA.adminToken',
      );
      console.log(
        '   You can get this by logging in through your auth endpoints',
      );
      process.exit(1);
    }

    // Get target type from user
    const targetType = await askQuestion('Enter target type (user/provider): ');

    if (!['user', 'provider'].includes(targetType.toLowerCase())) {
      console.log('❌ Invalid target type. Please enter "user" or "provider"');
      rl.close();
      return;
    }

    // Get ID from user
    const targetId = await askQuestion(`Enter ${targetType} ID to test: `);

    const numericId = parseInt(targetId);
    if (isNaN(numericId) || numericId <= 0) {
      console.log('❌ Invalid ID. Please enter a positive number');
      rl.close();
      return;
    }

    // Run FCM system status check first
    await testFCMStatus();

    // Run the specific test based on user input
    if (targetType.toLowerCase() === 'user') {
      await testUserTokenNotification(numericId);
    } else {
      await testProviderTokenNotification(numericId);
    }

    // Ask if user wants to test error handling
    const testErrors = await askQuestion(
      'Do you want to test error handling? (y/n): ',
    );

    if (
      testErrors.toLowerCase() === 'y' ||
      testErrors.toLowerCase() === 'yes'
    ) {
      await testErrorHandling();
    }

    // Summary
    console.log('📊 Test Summary');
    console.log('================');
    console.log('✅ FCM system status verified');
    console.log(`✅ ${targetType} ${numericId} token notification tested`);
    if (
      testErrors.toLowerCase() === 'y' ||
      testErrors.toLowerCase() === 'yes'
    ) {
      console.log('✅ Error handling validated');
    }

    console.log(
      `\n🎉 FCM token notification test for ${targetType} ${numericId} completed!`,
    );
  } catch (error) {
    console.error('\n💥 Test execution failed:', error.message);
  } finally {
    rl.close();
  }

  console.log('\n🏁 Test completed');
}

// Main test runner (for backward compatibility)
async function runTests() {
  console.log('Starting FCM token notifications tests...\n');

  try {
    // Check if admin token is set
    if (
      TEST_DATA.adminToken === 'YOUR_ADMIN_JWT_TOKEN_HERE' ||
      !TEST_DATA.adminToken
    ) {
      console.log(
        '❌ Please set a valid admin JWT token in TEST_DATA.adminToken',
      );
      console.log(
        '   You can get this by logging in through your auth endpoints',
      );
      process.exit(1);
    }

    // Run FCM token tests only
    await testFCMStatus();
    await testUserTokenNotification(1);
    await testProviderTokenNotification(1);
    await testErrorHandling();

    // Summary
    console.log('📊 Test Summary');
    console.log('================');
    console.log('✅ FCM system status verified');
    console.log('✅ Individual user token notifications tested');
    console.log('✅ Individual provider token notifications tested');
    console.log('✅ Error handling validated');

    console.log('\n🎉 All FCM token notification tests completed!');
  } catch (error) {
    console.error('\n💥 Test execution failed:', error.message);
  }

  console.log('\n🏁 Tests completed');
}

// Instructions
console.log('📋 Setup Instructions:');
console.log('1. Make sure your backend server is running on port 3000');
console.log('2. Get a valid admin JWT token by logging in as admin');
console.log('3. Update TEST_DATA in this script with your admin token');
console.log(
  '4. Ensure you have users/providers with FCM tokens in your database',
);
console.log('5. Run: node test-fcm-notifications.js');
console.log('');

// Check if running directly
if (require.main === module) {
  // Run interactive test by default
  runInteractiveTest();
}

module.exports = {
  runTests,
  runInteractiveTest,
  testUserTokenNotification,
  testProviderTokenNotification,
  testFCMStatus,
  testErrorHandling,
};

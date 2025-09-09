const axios = require('axios');

const BASE_URL = 'http://localhost:3069';

// Test data from the admin panel screenshot
const testCredentials = [
  // Provider credentials (from admin panel)
  {
    type: 'Provider',
    phone: '+963998419874',
    password: '123456',
    name: 'adnan',
    isActive: true
  },
  {
    type: 'Provider', 
    phone: '+963998419871',
    password: '123456',
    name: 'faisal',
    isActive: false
  },
  {
    type: 'Provider',
    phone: '+963994636922', 
    password: '123456',
    name: 'test',
    isActive: true
  },
  // Test user credentials
  {
    type: 'User',
    phone: '+966501234567',
    password: '123456',
    name: 'Test User'
  }
];

async function testLogin(credentials) {
  try {
    console.log(`\n🧪 Testing ${credentials.type} login with phone: ${credentials.phone}`);
    
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      phone: credentials.phone,
      password: credentials.password
    });

    console.log(`✅ SUCCESS: ${credentials.type} login successful`);
    console.log(`   User ID: ${response.data.user.id}`);
    console.log(`   Role: ${response.data.user.role}`);
    console.log(`   Token: ${response.data.access_token.substring(0, 20)}...`);
    
    return { success: true, data: response.data };
  } catch (error) {
    console.log(`❌ FAILED: ${credentials.type} login failed`);
    console.log(`   Error: ${error.response?.data?.message || error.message}`);
    console.log(`   Status: ${error.response?.status || 'No response'}`);
    
    return { success: false, error: error.response?.data || error.message };
  }
}

async function testEmailLogin(credentials) {
  try {
    console.log(`\n🧪 Testing ${credentials.type} login with email: ${credentials.email || 'N/A'}`);
    
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: credentials.email,
      password: credentials.password
    });

    console.log(`✅ SUCCESS: ${credentials.type} email login successful`);
    console.log(`   User ID: ${response.data.user.id}`);
    console.log(`   Role: ${response.data.user.role}`);
    console.log(`   Token: ${response.data.access_token.substring(0, 20)}...`);
    
    return { success: true, data: response.data };
  } catch (error) {
    console.log(`❌ FAILED: ${credentials.type} email login failed`);
    console.log(`   Error: ${error.response?.data?.message || error.message}`);
    console.log(`   Status: ${error.response?.status || 'No response'}`);
    
    return { success: false, error: error.response?.data || error.message };
  }
}

async function testServerHealth() {
  try {
    console.log('🏥 Testing server health...');
    const response = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Server is running and healthy');
    return true;
  } catch (error) {
    console.log('❌ Server health check failed');
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting Authentication System Tests');
  console.log('=====================================');
  
  // Test server health first
  const serverHealthy = await testServerHealth();
  if (!serverHealthy) {
    console.log('\n❌ Server is not running or not accessible');
    console.log('Please make sure the server is running on port 3069');
    return;
  }

  console.log('\n📱 Testing Phone Login for All User Types');
  console.log('==========================================');

  const results = [];
  
  // Test phone login for all credentials
  for (const credentials of testCredentials) {
    const result = await testLogin(credentials);
    results.push({
      type: credentials.type,
      phone: credentials.phone,
      method: 'phone',
      ...result
    });
  }

  // Test email login if email is available
  console.log('\n📧 Testing Email Login (if available)');
  console.log('=====================================');
  
  const emailCredentials = testCredentials.filter(c => c.email);
  for (const credentials of emailCredentials) {
    const result = await testEmailLogin(credentials);
    results.push({
      type: credentials.type,
      email: credentials.email,
      method: 'email',
      ...result
    });
  }

  // Summary
  console.log('\n📊 Test Results Summary');
  console.log('=======================');
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`✅ Successful logins: ${successful.length}`);
  console.log(`❌ Failed logins: ${failed.length}`);
  
  if (successful.length > 0) {
    console.log('\n✅ Successful Tests:');
    successful.forEach(r => {
      console.log(`   ${r.type} (${r.method}): ${r.phone || r.email}`);
    });
  }
  
  if (failed.length > 0) {
    console.log('\n❌ Failed Tests:');
    failed.forEach(r => {
      console.log(`   ${r.type} (${r.method}): ${r.phone || r.email} - ${r.error?.message || 'Unknown error'}`);
    });
  }

  console.log('\n🎯 Authentication System Test Complete!');
}

runTests().catch(console.error);

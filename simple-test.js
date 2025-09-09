// Simple test script to verify authentication
const http = require('http');

const BASE_URL = 'http://localhost:3069';

function makeRequest(method, path, data) {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : '';
    
    const options = {
      hostname: 'localhost',
      port: 3069,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({
            status: res.statusCode,
            data: parsed
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: responseData
          });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (postData) {
      req.write(postData);
    }
    
    req.end();
  });
}

async function testHealth() {
  try {
    console.log('🏥 Testing server health...');
    const response = await makeRequest('GET', '/health');
    console.log(`✅ Health check: ${response.status}`);
    return response.status === 200;
  } catch (error) {
    console.log(`❌ Health check failed: ${error.message}`);
    return false;
  }
}

async function testProviderPhoneLogin() {
  try {
    console.log('\n🧪 Testing provider phone login...');
    console.log('   Phone: +963998419874 (adnan - isActive: true)');
    
    const response = await makeRequest('POST', '/auth/login', {
      phone: '+963998419874',
      password: '123456'
    });
    
    if (response.status === 200) {
      console.log('✅ Provider phone login successful!');
      console.log(`   Role: ${response.data.user?.role}`);
      console.log(`   User ID: ${response.data.user?.id}`);
      return true;
    } else {
      console.log(`❌ Provider phone login failed: ${response.status}`);
      console.log(`   Error: ${response.data?.message || 'Unknown error'}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Provider phone login error: ${error.message}`);
    return false;
  }
}

async function testUserPhoneLogin() {
  try {
    console.log('\n🧪 Testing user phone login...');
    console.log('   Phone: +966501234567 (test user)');
    
    const response = await makeRequest('POST', '/auth/login', {
      phone: '+966501234567',
      password: '123456'
    });
    
    if (response.status === 200) {
      console.log('✅ User phone login successful!');
      console.log(`   Role: ${response.data.user?.role}`);
      console.log(`   User ID: ${response.data.user?.id}`);
      return true;
    } else {
      console.log(`❌ User phone login failed: ${response.status}`);
      console.log(`   Error: ${response.data?.message || 'Unknown error'}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ User phone login error: ${error.message}`);
    return false;
  }
}

async function testInactiveProvider() {
  try {
    console.log('\n🧪 Testing inactive provider login...');
    console.log('   Phone: +963998419871 (faisal - isActive: false)');
    
    const response = await makeRequest('POST', '/auth/login', {
      phone: '+963998419871',
      password: '123456'
    });
    
    if (response.status === 401 || response.status === 400) {
      console.log('✅ Inactive provider correctly rejected!');
      console.log(`   Error: ${response.data?.message || 'Account inactive'}`);
      return true;
    } else {
      console.log(`❌ Inactive provider login unexpectedly succeeded: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Inactive provider test error: ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting Authentication Tests on Port 3069');
  console.log('=============================================');
  
  // Test server health
  const serverHealthy = await testHealth();
  if (!serverHealthy) {
    console.log('\n❌ Server is not responding on port 3069');
    console.log('Please make sure the server is running');
    return;
  }
  
  // Test provider phone login
  const providerSuccess = await testProviderPhoneLogin();
  
  // Test user phone login  
  const userSuccess = await testUserPhoneLogin();
  
  // Test inactive provider rejection
  const inactiveTest = await testInactiveProvider();
  
  // Summary
  console.log('\n📊 Test Results Summary');
  console.log('=======================');
  console.log(`✅ Server Health: ${serverHealthy ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Provider Phone Login: ${providerSuccess ? 'PASS' : 'FAIL'}`);
  console.log(`✅ User Phone Login: ${userSuccess ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Inactive Provider Rejection: ${inactiveTest ? 'PASS' : 'FAIL'}`);
  
  const totalTests = 4;
  const passedTests = [serverHealthy, providerSuccess, userSuccess, inactiveTest].filter(Boolean).length;
  
  console.log(`\n🎯 Overall Result: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All authentication tests passed! The system is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Please check the server and database.');
  }
}

runTests().catch(console.error);

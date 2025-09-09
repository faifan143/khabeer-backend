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
        'Content-Length': Buffer.byteLength(postData),
      },
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
            data: parsed,
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: responseData,
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

async function testServerHealth() {
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

async function testUserSignup() {
  try {
    console.log('\n👤 Testing USER signup...');

    const userData = {
      registerType: 'USER',
      name: 'Test User',
      email: 'testuser@example.com',
      password: 'user123456',
      phone: '+966501234567',
      address: 'Test Address',
      state: 'Riyadh',
      image: '',
    };

    console.log('   Data:', JSON.stringify(userData, null, 2));

    const response = await makeRequest('POST', '/auth/register', userData);

    if (response.status === 201 || response.status === 200) {
      console.log('✅ User signup successful!');
      console.log(`   User ID: ${response.data?.user?.id || 'N/A'}`);
      console.log(`   Message: ${response.data?.message || 'Success'}`);
      return { success: true, data: response.data };
    } else {
      console.log(`❌ User signup failed: ${response.status}`);
      console.log(`   Error: ${response.data?.message || 'Unknown error'}`);
      return { success: false, error: response.data };
    }
  } catch (error) {
    console.log(`❌ User signup error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function testProviderSignup() {
  try {
    console.log('\n🏢 Testing PROVIDER signup...');

    const providerData = {
      registerType: 'PROVIDER',
      name: 'Test Provider',
      email: 'testprovider@example.com',
      password: 'provider123456',
      phone: '+966501234568',
      description: 'Test provider description',
      state: 'Riyadh',
      image: '',
    };

    console.log('   Data:', JSON.stringify(providerData, null, 2));

    const response = await makeRequest('POST', '/auth/register', providerData);

    if (response.status === 201 || response.status === 200) {
      console.log('✅ Provider signup successful!');
      console.log(`   Provider ID: ${response.data?.provider?.id || 'N/A'}`);
      console.log(`   Message: ${response.data?.message || 'Success'}`);
      return { success: true, data: response.data };
    } else {
      console.log(`❌ Provider signup failed: ${response.status}`);
      console.log(`   Error: ${response.data?.message || 'Unknown error'}`);
      return { success: false, error: response.data };
    }
  } catch (error) {
    console.log(`❌ Provider signup error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function testUserLogin(phone, password) {
  try {
    console.log('\n👤 Testing USER login...');
    console.log(`   Phone: ${phone}`);

    const response = await makeRequest('POST', '/auth/login', {
      phone: phone,
      password: password,
    });

    if (response.status === 200) {
      console.log('✅ User login successful!');
      console.log(`   User ID: ${response.data?.user?.id}`);
      console.log(`   Role: ${response.data?.user?.role}`);
      console.log(
        `   Token: ${response.data?.access_token?.substring(0, 20)}...`,
      );
      return { success: true, data: response.data };
    } else {
      console.log(`❌ User login failed: ${response.status}`);
      console.log(`   Error: ${response.data?.message || 'Unknown error'}`);
      return { success: false, error: response.data };
    }
  } catch (error) {
    console.log(`❌ User login error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function testUserEmailLogin(email, password) {
  try {
    console.log('\n👤 Testing USER email login...');
    console.log(`   Email: ${email}`);

    const response = await makeRequest('POST', '/auth/login', {
      email: email,
      password: password,
    });

    if (response.status === 200) {
      console.log('✅ User email login successful!');
      console.log(`   User ID: ${response.data?.user?.id}`);
      console.log(`   Role: ${response.data?.user?.role}`);
      console.log(
        `   Token: ${response.data?.access_token?.substring(0, 20)}...`,
      );
      return { success: true, data: response.data };
    } else {
      console.log(`❌ User email login failed: ${response.status}`);
      console.log(`   Error: ${response.data?.message || 'Unknown error'}`);
      return { success: false, error: response.data };
    }
  } catch (error) {
    console.log(`❌ User email login error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function testProviderLogin(phone, password) {
  try {
    console.log('\n🏢 Testing PROVIDER login...');
    console.log(`   Phone: ${phone}`);

    const response = await makeRequest('POST', '/auth/login', {
      phone: phone,
      password: password,
    });

    if (response.status === 200) {
      console.log('✅ Provider login successful!');
      console.log(`   Provider ID: ${response.data?.user?.id}`);
      console.log(`   Role: ${response.data?.user?.role}`);
      console.log(
        `   Token: ${response.data?.access_token?.substring(0, 20)}...`,
      );
      return { success: true, data: response.data };
    } else {
      console.log(`❌ Provider login failed: ${response.status}`);
      console.log(`   Error: ${response.data?.message || 'Unknown error'}`);
      return { success: false, error: response.data };
    }
  } catch (error) {
    console.log(`❌ Provider login error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function testProviderEmailLogin(email, password) {
  try {
    console.log('\n🏢 Testing PROVIDER email login...');
    console.log(`   Email: ${email}`);

    const response = await makeRequest('POST', '/auth/login', {
      email: email,
      password: password,
    });

    if (response.status === 200) {
      console.log('✅ Provider email login successful!');
      console.log(`   Provider ID: ${response.data?.user?.id}`);
      console.log(`   Role: ${response.data?.user?.role}`);
      console.log(
        `   Token: ${response.data?.access_token?.substring(0, 20)}...`,
      );
      return { success: true, data: response.data };
    } else {
      console.log(`❌ Provider email login failed: ${response.status}`);
      console.log(`   Error: ${response.data?.message || 'Unknown error'}`);
      return { success: false, error: response.data };
    }
  } catch (error) {
    console.log(`❌ Provider email login error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function testExistingProviderLogin() {
  try {
    console.log('\n🏢 Testing existing provider login (from admin panel)...');
    console.log('   Phone: +963998419874 (adnan - isActive: true)');

    const response = await makeRequest('POST', '/auth/login', {
      phone: '+963998419874',
      password: '123456',
    });

    if (response.status === 200) {
      console.log('✅ Existing provider login successful!');
      console.log(`   Provider ID: ${response.data?.user?.id}`);
      console.log(`   Role: ${response.data?.user?.role}`);
      return { success: true, data: response.data };
    } else {
      console.log(`❌ Existing provider login failed: ${response.status}`);
      console.log(`   Error: ${response.data?.message || 'Unknown error'}`);
      return { success: false, error: response.data };
    }
  } catch (error) {
    console.log(`❌ Existing provider login error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runCompleteTest() {
  console.log('🚀 Complete Signup-Login Test Suite');
  console.log('===================================');

  // Test server health
  const serverHealthy = await testServerHealth();
  if (!serverHealthy) {
    console.log('\n❌ Server is not responding on port 3069');
    console.log('Please make sure the server is running');
    return;
  }

  const results = [];

  // Test existing provider login (from admin panel)
  console.log('\n📋 Testing existing provider from admin panel...');
  const existingProvider = await testExistingProviderLogin();
  results.push({ test: 'Existing Provider Login', ...existingProvider });

  // Test user signup
  console.log('\n📋 Testing user signup...');
  const userSignup = await testUserSignup();
  results.push({ test: 'User Signup', ...userSignup });

  // Test provider signup
  console.log('\n📋 Testing provider signup...');
  const providerSignup = await testProviderSignup();
  results.push({ test: 'Provider Signup', ...providerSignup });

  // Test user login with phone
  if (userSignup.success) {
    const userPhoneLogin = await testUserLogin('+966501234567', 'user123456');
    results.push({ test: 'User Phone Login', ...userPhoneLogin });
  }

  // Test user login with email
  if (userSignup.success) {
    const userEmailLogin = await testUserEmailLogin(
      'testuser@example.com',
      'user123456',
    );
    results.push({ test: 'User Email Login', ...userEmailLogin });
  }

  // Test provider login with phone
  if (providerSignup.success) {
    const providerPhoneLogin = await testProviderLogin(
      '+966501234568',
      'provider123456',
    );
    results.push({ test: 'Provider Phone Login', ...providerPhoneLogin });
  }

  // Test provider login with email
  if (providerSignup.success) {
    const providerEmailLogin = await testProviderEmailLogin(
      'testprovider@example.com',
      'provider123456',
    );
    results.push({ test: 'Provider Email Login', ...providerEmailLogin });
  }

  // Summary
  console.log('\n📊 Test Results Summary');
  console.log('=======================');

  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  console.log(`✅ Successful tests: ${successful.length}`);
  console.log(`❌ Failed tests: ${failed.length}`);

  if (successful.length > 0) {
    console.log('\n✅ Successful Tests:');
    successful.forEach((r) => {
      console.log(`   ✓ ${r.test}`);
    });
  }

  if (failed.length > 0) {
    console.log('\n❌ Failed Tests:');
    failed.forEach((r) => {
      console.log(`   ✗ ${r.test}: ${r.error?.message || 'Unknown error'}`);
    });
  }

  console.log('\n🎯 Authentication System Test Complete!');
  console.log(
    `Overall Result: ${successful.length}/${results.length} tests passed`,
  );

  if (successful.length === results.length) {
    console.log(
      '🎉 All tests passed! The authentication system is working perfectly.',
    );
  } else {
    console.log(
      '⚠️  Some tests failed. Please check the server logs and database.',
    );
  }
}

runCompleteTest().catch(console.error);

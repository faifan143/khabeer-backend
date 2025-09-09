const axios = require('axios');

async function debugAuth() {
  try {
    console.log('🔍 Debugging authentication issue...\n');
    
    // Test 1: Check if server is responding
    console.log('1. Testing server health...');
    try {
      const healthResponse = await axios.get('http://localhost:3069/health');
      console.log('✅ Server is running:', healthResponse.data);
    } catch (error) {
      console.log('❌ Server health check failed:', error.message);
      return;
    }
    
    // Test 2: Try admin login
    console.log('\n2. Testing admin login...');
    const loginResponse = await axios.post('http://localhost:3069/auth/login', {
      email: 'admin@example.com',
      password: 'admin123'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Admin login successful!');
    const adminToken = loginResponse.data.access_token;
    console.log('Token (first 50 chars):', adminToken.substring(0, 50) + '...');
    
    // Test 3: Test /auth/me endpoint
    console.log('\n3. Testing /auth/me endpoint...');
    const meResponse = await axios.post('http://localhost:3069/auth/me', {}, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ /auth/me successful!');
    console.log('User info:', JSON.stringify(meResponse.data, null, 2));
    
    // Test 4: Test provider status update
    console.log('\n4. Testing provider status update...');
    const statusResponse = await axios.put('http://localhost:3069/providers/2/status', {
      isActive: true
    }, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Provider status update successful!');
    console.log('Response:', JSON.stringify(statusResponse.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error at step:', error.config?.url || 'unknown');
    console.error('Status:', error.response?.status);
    console.error('Data:', JSON.stringify(error.response?.data, null, 2));
    console.error('Headers:', JSON.stringify(error.response?.headers, null, 2));
  }
}

debugAuth();


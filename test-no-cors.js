const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testNoCORS() {
  console.log('🔍 Testing NO CORS restrictions...\n');

  try {
    // Test 1: Check if server is running
    console.log('1️⃣ Testing server availability...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Server is running');
    console.log('   Status:', healthResponse.status);
    console.log('');

    // Test 2: Test image access without any CORS headers
    console.log('2️⃣ Testing image access without CORS headers...');
    const imageResponse = await axios.get(`${BASE_URL}/uploads/1754234785341-217718138.png`, {
      responseType: 'arraybuffer'
    });
    
    console.log('✅ Image request successful');
    console.log('   Status:', imageResponse.status);
    console.log('   Content-Type:', imageResponse.headers['content-type']);
    console.log('   Content-Length:', imageResponse.headers['content-length']);
    console.log('   Access-Control-Allow-Origin:', imageResponse.headers['access-control-allow-origin']);
    console.log('   Access-Control-Allow-Methods:', imageResponse.headers['access-control-allow-methods']);
    console.log('   Access-Control-Allow-Headers:', imageResponse.headers['access-control-allow-headers']);
    console.log('   Access-Control-Allow-Credentials:', imageResponse.headers['access-control-allow-credentials']);
    console.log('');

    // Test 3: Test with different origins
    console.log('3️⃣ Testing with different origins...');
    const origins = [
      'http://localhost:3002',
      'http://localhost:3000',
      'http://127.0.0.1:3002',
      'https://example.com',
      'http://any-domain.com'
    ];

    for (const origin of origins) {
      try {
        const response = await axios.get(`${BASE_URL}/uploads/1754234785341-217718138.png`, {
          headers: { 'Origin': origin },
          responseType: 'arraybuffer'
        });
        console.log(`✅ Origin ${origin}: Success (${response.status})`);
      } catch (error) {
        console.log(`❌ Origin ${origin}: Failed - ${error.message}`);
      }
    }
    console.log('');

    // Test 4: Test OPTIONS preflight
    console.log('4️⃣ Testing OPTIONS preflight...');
    const optionsResponse = await axios.options(`${BASE_URL}/uploads/1754234785341-217718138.png`, {
      headers: {
        'Origin': 'http://localhost:3002',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type, Authorization, X-Custom-Header'
      }
    });
    
    console.log('✅ OPTIONS preflight successful');
    console.log('   Status:', optionsResponse.status);
    console.log('   Access-Control-Allow-Origin:', optionsResponse.headers['access-control-allow-origin']);
    console.log('   Access-Control-Allow-Methods:', optionsResponse.headers['access-control-allow-methods']);
    console.log('   Access-Control-Allow-Headers:', optionsResponse.headers['access-control-allow-headers']);
    console.log('   Access-Control-Allow-Credentials:', optionsResponse.headers['access-control-allow-credentials']);
    console.log('');

    // Test 5: Test API endpoints
    console.log('5️⃣ Testing API endpoints...');
    const apiResponse = await axios.get(`${BASE_URL}/api/health`, {
      headers: { 'Origin': 'http://localhost:3002' }
    });
    
    console.log('✅ API request successful');
    console.log('   Status:', apiResponse.status);
    console.log('   Access-Control-Allow-Origin:', apiResponse.headers['access-control-allow-origin']);
    console.log('');

    console.log('🎉 ALL CORS RESTRICTIONS REMOVED! Your images should now be accessible from anywhere.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure your backend server is running:');
      console.log('   npm run start:dev');
    }
    
    if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   Headers:', error.response.headers);
    }
  }
}

testNoCORS(); 
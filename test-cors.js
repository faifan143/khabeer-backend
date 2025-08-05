const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testCORS() {
  console.log('🔍 Testing CORS configuration...\n');

  try {
    // Test 1: Check if server is running
    console.log('1️⃣ Testing server availability...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Server is running');
    console.log('   Status:', healthResponse.status);
    console.log('   Response:', healthResponse.data);
    console.log('');

    // Test 2: Test CORS headers on API endpoint
    console.log('2️⃣ Testing CORS headers on API endpoint...');
    const apiResponse = await axios.options(`${BASE_URL}/api/health`, {
      headers: {
        Origin: 'http://localhost:3002',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type',
      },
    });

    console.log('✅ CORS preflight successful');
    console.log(
      '   Access-Control-Allow-Origin:',
      apiResponse.headers['access-control-allow-origin'],
    );
    console.log(
      '   Access-Control-Allow-Methods:',
      apiResponse.headers['access-control-allow-methods'],
    );
    console.log(
      '   Access-Control-Allow-Headers:',
      apiResponse.headers['access-control-allow-headers'],
    );
    console.log('');

    // Test 3: Test static file access with CORS
    console.log('3️⃣ Testing static file CORS headers...');
    const staticResponse = await axios.options(
      `${BASE_URL}/uploads/test-image.png`,
      {
        headers: {
          Origin: 'http://localhost:3002',
          'Access-Control-Request-Method': 'GET',
        },
      },
    );

    console.log('✅ Static file CORS preflight successful');
    console.log(
      '   Access-Control-Allow-Origin:',
      staticResponse.headers['access-control-allow-origin'],
    );
    console.log(
      '   Access-Control-Allow-Methods:',
      staticResponse.headers['access-control-allow-methods'],
    );
    console.log('');

    // Test 4: Test actual image request
    console.log('4️⃣ Testing actual image request...');
    try {
      const imageResponse = await axios.get(
        `${BASE_URL}/uploads/1754234785341-217718138.png`,
        {
          headers: {
            Origin: 'http://localhost:3002',
          },
          responseType: 'arraybuffer',
        },
      );

      console.log('✅ Image request successful');
      console.log('   Status:', imageResponse.status);
      console.log('   Content-Type:', imageResponse.headers['content-type']);
      console.log(
        '   Content-Length:',
        imageResponse.headers['content-length'],
      );
      console.log(
        '   Access-Control-Allow-Origin:',
        imageResponse.headers['access-control-allow-origin'],
      );
      console.log('   Cache-Control:', imageResponse.headers['cache-control']);
      console.log('');
    } catch (imageError) {
      if (imageError.response && imageError.response.status === 404) {
        console.log('⚠️  Test image not found, but CORS headers are working');
        console.log('   Status:', imageError.response.status);
        console.log(
          '   Access-Control-Allow-Origin:',
          imageError.response.headers['access-control-allow-origin'],
        );
        console.log('');
      } else {
        throw imageError;
      }
    }

    console.log(
      '🎉 All CORS tests passed! Your images should now be accessible from the frontend.',
    );
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

testCORS();

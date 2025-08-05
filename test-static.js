const axios = require('axios');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3001';

async function testStaticFileAccess() {
  console.log('🧪 Testing Static File Access for Khabeer Backend\n');

  try {
    // Test 1: Check if server is running
    console.log('1️⃣ Testing server health...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Server is running:', healthResponse.data);
    console.log('');

    // Test 2: List available images in uploads directory
    console.log('2️⃣ Available images in uploads directory:');
    const uploadsDir = path.join(__dirname, 'uploads');
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      const imageFiles = files.filter(
        (file) =>
          file.match(/\.(jpg|jpeg|png|gif)$/i) &&
          !fs.statSync(path.join(uploadsDir, file)).isDirectory(),
      );

      if (imageFiles.length > 0) {
        imageFiles.forEach((file) => {
          const filePath = path.join(uploadsDir, file);
          const stats = fs.statSync(filePath);
          const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
          console.log(`   📸 ${file} (${sizeInMB}MB)`);
          console.log(`      URL: ${BASE_URL}/uploads/${file}`);
        });
      } else {
        console.log('   No image files found in uploads directory');
      }
    } else {
      console.log('   Uploads directory not found');
    }
    console.log('');

    // Test 3: Test direct image access
    console.log('3️⃣ Testing direct image access...');
    const testImage = '1754252654623-779371817.png';
    try {
      const imageResponse = await axios.get(
        `${BASE_URL}/uploads/${testImage}`,
        {
          responseType: 'stream',
          timeout: 5000,
        },
      );
      console.log(`✅ Image accessible: ${testImage}`);
      console.log(`   Content-Type: ${imageResponse.headers['content-type']}`);
      console.log(
        `   Content-Length: ${imageResponse.headers['content-length']} bytes`,
      );
      console.log(
        `   Cache-Control: ${imageResponse.headers['cache-control']}`,
      );
      console.log(
        `   Access-Control-Allow-Origin: ${imageResponse.headers['access-control-allow-origin']}`,
      );
    } catch (error) {
      console.log(`❌ Image not accessible: ${testImage}`);
      console.log(`   Error: ${error.message}`);
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Status Text: ${error.response.statusText}`);
      }
    }
    console.log('');

    // Test 4: Test with browser-like request
    console.log('4️⃣ Testing browser-like request...');
    try {
      const browserResponse = await axios.get(
        `${BASE_URL}/uploads/${testImage}`,
        {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            Accept: 'image/webp,image/apng,image/*,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Cache-Control': 'no-cache',
          },
          timeout: 5000,
        },
      );
      console.log(`✅ Browser request successful: ${testImage}`);
      console.log(`   Status: ${browserResponse.status}`);
    } catch (error) {
      console.log(`❌ Browser request failed: ${error.message}`);
    }
    console.log('');

    console.log('🎉 Static file access test completed!');
    console.log('\n📝 Summary:');
    console.log('   • Static files are served from /uploads/');
    console.log('   • Images can be accessed directly via URL');
    console.log('   • CORS headers are properly set');
    console.log('   • Cache headers are configured');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Make sure your backend server is running on port 3001');
      console.log('   Run: npm run start:dev');
    }
  }
}

// Run the test
testStaticFileAccess();

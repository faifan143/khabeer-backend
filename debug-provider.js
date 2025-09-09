const http = require('http');

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
            raw: responseData,
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: responseData,
            raw: responseData,
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

async function debugProviderLogin() {
  console.log('🔍 Debugging Provider Login Issue');
  console.log('=================================');

  // Test data from admin panel
  const testProviders = [
    { name: 'adnan', phone: '+963998419874', password: '123456' },
    { name: 'faisal', phone: '+963998419871', password: '123456' },
    { name: 'test', phone: '+963994636922', password: '123456' },
    { name: 'test2', phone: '+963994626977', password: '123456' },
  ];

  for (const provider of testProviders) {
    console.log(`\n🧪 Testing ${provider.name} (${provider.phone})`);
    console.log('----------------------------------------');

    try {
      const response = await makeRequest('POST', '/auth/login', {
        phone: provider.phone,
        password: provider.password,
      });

      console.log(`Status: ${response.status}`);
      console.log(`Response:`, JSON.stringify(response.data, null, 2));

      if (response.status === 200) {
        console.log('✅ Login successful!');
        console.log(`   User ID: ${response.data?.user?.id}`);
        console.log(`   Role: ${response.data?.user?.role}`);
        console.log(
          `   Token: ${response.data?.access_token?.substring(0, 30)}...`,
        );
      } else {
        console.log('❌ Login failed');
        console.log(`   Error: ${response.data?.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.log(`❌ Request failed: ${error.message}`);
    }
  }

  console.log('\n🔍 Debugging Complete');
  console.log('====================');
}

debugProviderLogin().catch(console.error);

const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

// Test user data
const TEST_USER = {
  name: 'OTP Bypass Test User',
  email: 'otpbypass@example.com',
  password: 'password123',
  phoneNumber: '+966500000999',
  role: 'USER'
};

async function testOtpBypass() {
  console.log('🧪 Testing OTP Bypass Functionality...\n');

  try {
    // Test 1: Direct registration without OTP
    console.log('1️⃣ Testing direct registration (no OTP required)...');
    const registerResponse = await axios.post(`${BASE_URL}/auth/phone/register`, TEST_USER);
    console.log('✅ Registration successful:', registerResponse.data.message);
    console.log('   User ID:', registerResponse.data.id);
    console.log('   Role:', registerResponse.data.role);
    console.log('');

    // Test 2: Login with email/password
    console.log('2️⃣ Testing email/password login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: TEST_USER.email,
      password: TEST_USER.password
    });
    console.log('✅ Login successful');
    console.log('   Token:', loginResponse.data.access_token.substring(0, 20) + '...');
    console.log('   User:', loginResponse.data.user);
    console.log('');

    // Test 3: Phone login
    console.log('3️⃣ Testing phone login...');
    const phoneLoginResponse = await axios.post(`${BASE_URL}/auth/phone/login`, {
      phoneNumber: TEST_USER.phoneNumber,
      password: TEST_USER.password
    });
    console.log('✅ Phone login successful');
    console.log('   Token:', phoneLoginResponse.data.access_token.substring(0, 20) + '...');
    console.log('   User:', phoneLoginResponse.data.user);
    console.log('');

    // Test 4: Two-step registration with fake OTP
    console.log('4️⃣ Testing two-step registration with fake OTP...');
    
    // Step 1: Initiate registration
    const initiateResponse = await axios.post(`${BASE_URL}/auth/register/initiate`, {
      ...TEST_USER,
      email: 'twostep@example.com',
      phoneNumber: '+966500000998'
    });
    console.log('✅ Registration initiated:', initiateResponse.data.message);
    
    // Step 2: Complete with fake OTP
    const completeResponse = await axios.post(`${BASE_URL}/auth/register/complete`, {
      ...TEST_USER,
      email: 'twostep@example.com',
      phoneNumber: '+966500000998',
      otp: 'FAKE_OTP_123456' // This should work when OTP is disabled
    });
    console.log('✅ Registration completed with fake OTP:', completeResponse.data.message);
    console.log('');

    // Test 5: Password reset with fake OTP
    console.log('5️⃣ Testing password reset with fake OTP...');
    
    // Send OTP for password reset
    const sendOtpResponse = await axios.post(`${BASE_URL}/auth/phone/password-reset/send-otp`, {
      phoneNumber: TEST_USER.phoneNumber
    });
    console.log('✅ OTP sent for password reset:', sendOtpResponse.data.message);
    
    // Reset password with fake OTP
    const resetResponse = await axios.post(`${BASE_URL}/auth/phone/password-reset`, {
      phoneNumber: TEST_USER.phoneNumber,
      otp: 'FAKE_OTP_654321',
      newPassword: 'newpassword123'
    });
    console.log('✅ Password reset with fake OTP:', resetResponse.data.message);
    console.log('');

    console.log('🎉 All OTP bypass tests passed!');
    console.log('📝 OTP verification is successfully disabled.');
    console.log('🔒 For production, set ENABLE_OTP=true to enable OTP verification.');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 400) {
      console.log('💡 This might indicate that OTP is still enabled.');
      console.log('   Check your ENABLE_OTP environment variable.');
    }
  }
}

// Check if server is running
async function checkServer() {
  try {
    await axios.get(`${BASE_URL}/health`);
    return true;
  } catch (error) {
    return false;
  }
}

async function main() {
  console.log('🚀 Khabeer OTP Bypass Test\n');
  
  // Check if server is running
  const serverRunning = await checkServer();
  if (!serverRunning) {
    console.log('❌ Server is not running. Please start the application first:');
    console.log('   docker-compose up -d');
    console.log('   or');
    console.log('   npm run start:dev');
    return;
  }
  
  console.log('✅ Server is running. Starting tests...\n');
  
  await testOtpBypass();
}

main().catch(console.error); 
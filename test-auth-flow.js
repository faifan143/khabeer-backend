const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

// Test configuration
const TEST_CONFIG = {
  ENABLE_OTP: process.env.ENABLE_OTP || 'true',
  ADMIN_EMAIL: 'admin@khabeer.com',
  ADMIN_PASSWORD: 'admin123',
  TEST_USER: {
    name: 'Test User',
    email: 'testuser@example.com',
    password: 'password123',
    phoneNumber: '+966500000000',
    role: 'USER',
  },
  TEST_PROVIDER: {
    name: 'Test Provider',
    email: 'testprovider@example.com',
    password: 'password123',
    phoneNumber: '+966500000001',
    role: 'PROVIDER',
    description: 'Test provider description',
  },
};

class AuthFlowTester {
  constructor() {
    this.adminToken = null;
    this.userToken = null;
    this.providerToken = null;
  }

  async log(message, data = null) {
    console.log(`[${new Date().toISOString()}] ${message}`);
    if (data) {
      console.log(JSON.stringify(data, null, 2));
    }
  }

  async testAdminFlow() {
    this.log('🧪 Testing Admin Flow...');

    try {
      // Admin Login
      const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
        email: TEST_CONFIG.ADMIN_EMAIL,
        password: TEST_CONFIG.ADMIN_PASSWORD,
      });

      this.adminToken = loginResponse.data.access_token;
      this.log('✅ Admin login successful', {
        token: this.adminToken.substring(0, 20) + '...',
      });

      return true;
    } catch (error) {
      this.log('❌ Admin login failed', error.response?.data || error.message);
      return false;
    }
  }

  async testUserRegistration() {
    this.log('🧪 Testing User Registration Flow...');

    try {
      // Step 1: Initiate registration
      const initiateResponse = await axios.post(
        `${BASE_URL}/auth/register/initiate`,
        TEST_CONFIG.TEST_USER,
      );
      this.log('✅ User registration initiated', initiateResponse.data);

      // Step 2: Complete registration (with OTP bypass if disabled)
      const completeData = {
        ...TEST_CONFIG.TEST_USER,
        otp: TEST_CONFIG.ENABLE_OTP === 'true' ? '123456' : 'any-otp',
      };

      const completeResponse = await axios.post(
        `${BASE_URL}/auth/register/complete`,
        completeData,
      );
      this.log('✅ User registration completed', completeResponse.data);

      // Test user login
      const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
        email: TEST_CONFIG.TEST_USER.email,
        password: TEST_CONFIG.TEST_USER.password,
      });

      this.userToken = loginResponse.data.access_token;
      this.log('✅ User login successful', {
        token: this.userToken.substring(0, 20) + '...',
      });

      return true;
    } catch (error) {
      this.log(
        '❌ User registration failed',
        error.response?.data || error.message,
      );
      return false;
    }
  }

  async testProviderRegistration() {
    this.log('🧪 Testing Provider Registration Flow...');

    try {
      // Step 1: Initiate provider registration
      const initiateResponse = await axios.post(
        `${BASE_URL}/auth/register/initiate`,
        TEST_CONFIG.TEST_PROVIDER,
      );
      this.log('✅ Provider registration initiated', initiateResponse.data);

      // Step 2: Complete provider registration
      const completeData = {
        ...TEST_CONFIG.TEST_PROVIDER,
        otp: TEST_CONFIG.ENABLE_OTP === 'true' ? '123456' : 'any-otp',
      };

      const completeResponse = await axios.post(
        `${BASE_URL}/auth/register/complete`,
        completeData,
      );
      this.log('✅ Provider registration completed', completeResponse.data);

      // Test provider login (should fail - not verified)
      try {
        await axios.post(`${BASE_URL}/auth/login`, {
          email: TEST_CONFIG.TEST_PROVIDER.email,
          password: TEST_CONFIG.TEST_PROVIDER.password,
        });
        this.log('❌ Provider login should have failed (not verified)');
        return false;
      } catch (error) {
        if (error.response?.data?.message?.includes('not verified')) {
          this.log('✅ Provider login correctly blocked (not verified)');
        } else {
          this.log(
            '❌ Unexpected error during provider login',
            error.response?.data,
          );
          return false;
        }
      }

      return true;
    } catch (error) {
      this.log(
        '❌ Provider registration failed',
        error.response?.data || error.message,
      );
      return false;
    }
  }

  async testPhoneLogin() {
    this.log('🧪 Testing Phone Login...');

    try {
      // Test phone login without password
      const phoneLoginResponse = await axios.post(
        `${BASE_URL}/auth/phone/login`,
        {
          phoneNumber: TEST_CONFIG.TEST_USER.phoneNumber,
        },
      );

      this.log(
        '✅ Phone login successful (no password)',
        phoneLoginResponse.data,
      );

      // Test phone login with password
      const phoneLoginWithPasswordResponse = await axios.post(
        `${BASE_URL}/auth/phone/login`,
        {
          phoneNumber: TEST_CONFIG.TEST_USER.phoneNumber,
          password: TEST_CONFIG.TEST_USER.password,
        },
      );

      this.log(
        '✅ Phone login successful (with password)',
        phoneLoginWithPasswordResponse.data,
      );

      return true;
    } catch (error) {
      this.log('❌ Phone login failed', error.response?.data || error.message);
      return false;
    }
  }

  async testProviderVerification() {
    this.log('🧪 Testing Provider Verification...');

    if (!this.adminToken) {
      this.log('❌ Admin token required for provider verification');
      return false;
    }

    try {
      // Get unverified providers
      const unverifiedResponse = await axios.get(
        `${BASE_URL}/admin/providers/unverified`,
        {
          headers: { Authorization: `Bearer ${this.adminToken}` },
        },
      );

      this.log('✅ Retrieved unverified providers', unverifiedResponse.data);

      if (unverifiedResponse.data.length > 0) {
        const providerId = unverifiedResponse.data[0].id;

        // Verify provider
        const verifyResponse = await axios.put(
          `${BASE_URL}/admin/verify-provider/${providerId}`,
          {},
          {
            headers: { Authorization: `Bearer ${this.adminToken}` },
          },
        );

        this.log('✅ Provider verified', verifyResponse.data);

        // Test provider login (should succeed now)
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
          email: TEST_CONFIG.TEST_PROVIDER.email,
          password: TEST_CONFIG.TEST_PROVIDER.password,
        });

        this.providerToken = loginResponse.data.access_token;
        this.log('✅ Provider login successful after verification', {
          token: this.providerToken.substring(0, 20) + '...',
        });

        return true;
      } else {
        this.log('⚠️ No unverified providers found');
        return true;
      }
    } catch (error) {
      this.log(
        '❌ Provider verification failed',
        error.response?.data || error.message,
      );
      return false;
    }
  }

  async runAllTests() {
    this.log('🚀 Starting Auth Flow Tests...');
    this.log(`📋 Test Configuration: ENABLE_OTP=${TEST_CONFIG.ENABLE_OTP}`);

    const results = {
      adminFlow: await this.testAdminFlow(),
      userRegistration: await this.testUserRegistration(),
      providerRegistration: await this.testProviderRegistration(),
      phoneLogin: await this.testPhoneLogin(),
      providerVerification: await this.testProviderVerification(),
    };

    this.log('📊 Test Results Summary:');
    Object.entries(results).forEach(([test, passed]) => {
      console.log(
        `${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`,
      );
    });

    const allPassed = Object.values(results).every((result) => result);
    this.log(allPassed ? '🎉 All tests passed!' : '💥 Some tests failed!');

    return allPassed;
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const tester = new AuthFlowTester();
  tester.runAllTests().catch(console.error);
}

module.exports = AuthFlowTester;

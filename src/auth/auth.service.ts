import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import * as bcrypt from 'bcryptjs';
import { ProvidersService } from '../providers/providers.service';
import { SmsService } from '../sms/sms.service';
import { UsersService } from '../users/users.service';
import { DirectPhoneLoginDto, PhoneLoginDto, PhoneLoginResponseDto } from './dto/phone-login.dto';
import { RegisterDto } from './dto/register.dto';

// Simple in-memory cache for registration data (in production, use Redis or database)
interface RegistrationCache {
  [phoneNumber: string]: {
    data: any;
    expiresAt: number;
  };
}

@Injectable()
export class AuthService {
  private registrationCache: RegistrationCache = {};

  constructor(
    private readonly usersService: UsersService,
    private readonly providersService: ProvidersService,
    private readonly smsService: SmsService,
    private readonly jwtService: JwtService,
  ) { }

  /**
   * Store registration data in cache with expiration
   */
  private storeRegistrationData(phoneNumber: string, data: any, expiresInMinutes: number = 10): void {
    const expiresAt = Date.now() + (expiresInMinutes * 60 * 1000);

    this.registrationCache[phoneNumber] = {
      data,
      expiresAt
    };

    // Clean up expired entries
    this.cleanupExpiredCache();
  }

  /**
   * Retrieve registration data from cache
   */
  private getRegistrationData(phoneNumber: string): any | null {
    const cached = this.registrationCache[phoneNumber];
    if (!cached) return null;

    if (Date.now() > cached.expiresAt) {
      delete this.registrationCache[phoneNumber];
      return null;
    }

    return cached.data;
  }

  /**
   * Remove registration data from cache
   */
  private removeRegistrationData(phoneNumber: string): void {
    delete this.registrationCache[phoneNumber];
  }

  /**
   * Clean up expired cache entries
   */
  private cleanupExpiredCache(): void {
    const now = Date.now();
    Object.keys(this.registrationCache).forEach(phoneNumber => {
      if (this.registrationCache[phoneNumber].expiresAt < now) {
        delete this.registrationCache[phoneNumber];
      }
    });
  }

  async validateUser(loginData: { email?: string; phone?: string; password: string }): Promise<any> {
    try {
      const { email, phone, password } = loginData;

      // Admin login - hardcoded credentials
      if (email === 'admin@khabeer.com' && password === 'admin123') {
        return {
          id: 0,
          email: 'admin@khabeer.com',
          name: 'System Administrator',
          role: 'ADMIN',
          isActive: true,
          isVerified: true
        };
      }

      // Provider login - by email (required)
      if (email && !phone) {
        const provider = await this.providersService.findByEmail(email);

        if (provider && provider.password) {
          const isPasswordValid = await bcrypt.compare(password, provider.password);

          if (isPasswordValid) {
            // Check if provider is verified
            if (!provider.isVerified) {
              throw new UnauthorizedException('Your account is not verified. Please wait for admin verification.');
            }
            const { password: _, ...result } = provider;
            return { ...result, role: 'PROVIDER' };
          }
        }
      }

      // User login - by phone (required)
      if (phone && !email) {
        const user = await this.usersService.findByPhone(phone);
        if (user && await bcrypt.compare(password, user.password)) {
          const { password: _, ...result } = user;
          return { ...result, role: user.role };
        }
      }

      // If we get here, either the credentials don't exist or password is wrong
      return null;
    } catch (error) {
      // Re-throw UnauthorizedException as-is
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      // Log other errors and throw a generic error
      console.error('Authentication error:', error);
      throw new InternalServerErrorException('Error validating user credentials');
    }
  }

  async login(user: { id: number; email?: string; phone?: string; role: string }) {
    try {
      const username = user.email || user.phone;
      const payload = { username, sub: user.id, role: user.role };

      const result = {
        access_token: this.jwtService.sign(payload),
        user: {
          id: user.id,
          email: user.email,
          phone: user.phone,
          role: user.role
        }
      };
      return result;
    } catch (error) {
      throw new InternalServerErrorException('Error generating authentication token');
    }
  }

  async loginWithFCM(user: { id: number; email?: string; phone?: string; role: string }, fcmToken?: string) {
    try {
      // Update FCM token if provided
      if (fcmToken) {
        if (user.role === 'PROVIDER') {
          await this.providersService.updateFCMToken(user.id, fcmToken);
        } else {
          await this.usersService.updateFCMToken(user.id, fcmToken);
        }
      }

      const username = user.email || user.phone;
      const payload = { username, sub: user.id, role: user.role };
      return {
        access_token: this.jwtService.sign(payload),
        user: {
          id: user.id,
          email: user.email,
          phone: user.phone,
          role: user.role
        }
      };
    } catch (error) {
      throw new InternalServerErrorException('Error generating authentication token');
    }
  }

  async register(data: RegisterDto) {
    try {
      // Validate required fields
      if (!data.password || !data.name) {
        throw new BadRequestException('Password and name are required');
      }

      // Validate password strength
      if (data.password.length < 6) {
        throw new BadRequestException('Password must be at least 6 characters long');
      }

      if (data.registerType === 'provider') {
        // Provider registration - email is required
        if (!data.email) {
          throw new BadRequestException('Email is required for provider registration');
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
          throw new BadRequestException('Invalid email format');
        }

        // Check if provider already exists
        const existingProvider = await this.providersService.findByEmail(data.email);
        if (existingProvider) {
          throw new ConflictException('Provider with this email already exists');
        }
      } else {
        // User registration - phone is required
        if (!data.phone) {
          throw new BadRequestException('Phone number is required for user registration');
        }

        // Check if user already exists with this phone
        const existingUser = await this.usersService.findByPhone(data.phone);
        if (existingUser) {
          throw new ConflictException('User with this phone number already exists');
        }
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, 10);

      // Prepare user data - only include fields that CreateUserDto expects
      const userData = {
        name: data.name,
        email: data.email || undefined, // Optional for users
        password: hashedPassword,
        image: data.image || '',
        address: data.address || '',
        phone: data.phone || '',
        state: data.state || '',
        role: data.role || 'USER',
        isActive: data.isActive ?? true,
        officialDocuments: data.officialDocuments,
        fcm: data.fcm || undefined // Include FCM token
      };

      // Create user or provider based on role
      if (data.role === 'PROVIDER') {
        // Create provider
        const providerData = {
          name: data.name,
          email: data.email!, // Email is required for providers
          password: hashedPassword,
          image: data.image || '',
          description: data.description || '',
          state: data.state || '',
          phone: data.phone || '',
          isActive: data.isActive ?? false, // Providers start as inactive
          isVerified: false,
          location: null,
          officialDocuments: data.officialDocuments || undefined,
          serviceIds: data.serviceIds || [], // Include service IDs for linking
          fcm: data.fcm || undefined // Include FCM token
        };

        const provider = await this.providersService.registerProviderWithServices(providerData);

        // Return provider data without password
        const { password, ...result } = provider as any;
        return {
          ...result,
          role: 'PROVIDER',
          message: 'Provider registered successfully. Please wait for admin verification to login.'
        };
      } else {
        // Create regular user
        const user = await this.usersService.create(userData);

        // Return user data without password
        const { password, ...result } = user;
        return {
          ...result,
          role: 'USER',
          message: 'User registered successfully'
        };
      }
    } catch (error) {
      // Handle Prisma-specific errors
      if (error instanceof PrismaClientKnownRequestError) {
        switch (error.code) {
          case 'P2002':
            if (error.meta?.target && Array.isArray(error.meta.target)) {
              if (error.meta.target.includes('email')) {
                throw new ConflictException('Provider with this email already exists');
              } else if (error.meta.target.includes('phone')) {
                throw new ConflictException('User with this phone number already exists');
              }
            }
            break;
          case 'P2003':
            throw new BadRequestException('Invalid reference data provided');
          case 'P2025':
            throw new BadRequestException('Record not found');
          default:
            throw new InternalServerErrorException('Database operation failed');
        }
      }

      // Re-throw our custom exceptions
      if (error instanceof BadRequestException ||
        error instanceof ConflictException ||
        error instanceof InternalServerErrorException) {
        throw error;
      }

      // Handle unexpected errors
      console.error('Registration error:', error);
      throw new InternalServerErrorException('Registration failed. Please try again.');
    }
  }

  async upgradeToProvider(userId: number, providerData: any) {
    try {
      // Get the existing user
      const user = await this.usersService.findById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Check if provider with this email already exists (if user has email)
      if (user.email) {
        const existingProvider = await this.providersService.findByEmail(user.email);
        if (existingProvider) {
          throw new ConflictException('Provider with this email already exists');
        }
      }

      // Create provider from user data
      const newProvider = await this.providersService.create({
        name: user.name,
        email: user.email || `${user.phone}@khabeer.local`, // Generate email if user doesn't have one
        password: user.password, // Use existing password
        image: user.image,
        description: providerData.description || '',
        state: user.state,
        phone: user.phone,
        isActive: false, // Start as inactive
        isVerified: false,
        location: null,
        officialDocuments: providerData.officialDocuments || null
      });

      // Optionally deactivate the user account
      // await this.usersService.update(userId, { isActive: false });

      return {
        ...newProvider,
        role: 'PROVIDER',
        message: 'Account upgraded to provider successfully. Please wait for admin approval.'
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Error upgrading account to provider');
    }
  }

  async checkAccountStatus(identifier: string, type: 'email' | 'phone' = 'email') {
    try {
      // Check for admin account first
      if (identifier === 'admin@khabeer.com' || identifier === '+966500000000') {
        return {
          exists: true,
          type: 'ADMIN',
          isActive: true, // Admins are always active
          isVerified: true, // Admins are always verified
          message: 'Admin account is active and verified.'
        };
      }

      if (type === 'email') {
        // Check if it's a provider (providers use email)
        const provider = await this.providersService.findByEmail(identifier);
        if (provider) {
          return {
            exists: true,
            type: 'PROVIDER',
            isActive: provider.isActive,
            isVerified: provider.isVerified,
            message: !provider.isVerified ? 'Account is not verified. Please wait for admin verification.' :
              !provider.isActive ? 'Account is verified but currently inactive. You can activate it to accept orders.' :
                'Account is verified and active.'
          };
        }

        // Check if it's a user by email (if user has email)
        const user = await this.usersService.findByEmail(identifier);
        if (user) {
          if (user.role === 'ADMIN') {
            return {
              exists: true,
              type: 'ADMIN',
              isActive: true, // Admins are always active
              isVerified: true, // Admins are always verified
              message: 'Admin account is active and verified.'
            };
          } else {
            return {
              exists: true,
              type: 'USER',
              isActive: user.isActive,
              isVerified: true, // Regular users don't need verification
              message: 'User account is ready to use. isActive status does not affect login.'
            };
          }
        }
      } else {
        // Check if it's a user by phone (users use phone)
        const user = await this.usersService.findByPhone(identifier);
        if (user) {
          if (user.role === 'ADMIN') {
            return {
              exists: true,
              type: 'ADMIN',
              isActive: true, // Admins are always active
              isVerified: true, // Admins are always verified
              message: 'Admin account is active and verified.'
            };
          } else {
            return {
              exists: true,
              type: 'USER',
              isActive: user.isActive,
              isVerified: true, // Regular users don't need verification
              message: 'User account is ready to use. isActive status does not affect login.'
            };
          }
        }
      }

      return {
        exists: false,
        message: 'Account not found'
      };
    } catch (error) {
      throw new InternalServerErrorException('Error checking account status');
    }
  }

  async activateProviderAccount(providerId: number) {
    try {
      // Try to find the provider directly by ID
      const provider = await this.providersService.findById(providerId);

      if (!provider.isVerified) {
        throw new BadRequestException('Your account must be verified by admin before you can activate it.');
      }

      const updatedProvider = await this.providersService.update(provider.id, { isActive: true });
      return {
        ...updatedProvider,
        message: 'Account activated successfully. You can now accept orders.'
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error activating provider account:', error);
      throw new InternalServerErrorException('Error activating account');
    }
  }

  async deactivateProviderAccount(providerId: number) {
    try {


      // Try to find the provider directly by ID
      const provider = await this.providersService.findById(providerId);

      const updatedProvider = await this.providersService.update(provider.id, { isActive: false });
      return {
        ...updatedProvider,
        message: 'Account deactivated successfully. You will not receive new orders.'
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error deactivating provider account:', error);
      throw new InternalServerErrorException('Error deactivating account');
    }
  }

  /**
   * Send OTP for phone-based operations (registration, password reset)
   */
  async sendPhoneLoginOtp(phoneLoginDto: PhoneLoginDto): Promise<{ success: boolean; message: string; expiresIn?: number }> {
    try {
      const { phoneNumber, purpose = 'registration' } = phoneLoginDto;

      // Check if phone number is already registered (for registration)
      if (purpose === 'registration') {
        const existingUser = await this.usersService.findByPhone(phoneNumber);
        const existingProvider = await this.providersService.findByPhone(phoneNumber);

        if (existingUser || existingProvider) {
          return {
            success: false,
            message: 'Phone number is already registered'
          };
        }
      }

      // Send OTP
      const result = await this.smsService.sendOtp({ phoneNumber, purpose });

      return {
        success: result.success,
        message: result.message,
        expiresIn: result.expiresIn
      };

    } catch (error) {
      return {
        success: false,
        message: 'Failed to send OTP'
      };
    }
  }

  /**
   * Send OTP specifically for password reset
   */
  async sendPasswordResetOtp(phoneNumber: string): Promise<{ success: boolean; message: string; expiresIn?: number }> {
    try {
      // Check if account exists with this phone number
      const user = await this.usersService.findByPhone(phoneNumber);
      const provider = await this.providersService.findByPhone(phoneNumber);

      if (!user && !provider) {
        return {
          success: false,
          message: 'No account found with this phone number'
        };
      }

      // Send OTP for password reset
      const result = await this.smsService.sendOtp({
        phoneNumber,
        purpose: 'password_reset'
      });

      return {
        success: result.success,
        message: result.message,
        expiresIn: result.expiresIn
      };

    } catch (error) {
      return {
        success: false,
        message: 'Failed to send password reset OTP'
      };
    }
  }

  /**
   * Phone login without OTP (main login method)
   */
  async phoneLogin(directPhoneLoginDto: DirectPhoneLoginDto): Promise<PhoneLoginResponseDto> {
    try {
      const { phoneNumber, password } = directPhoneLoginDto;

      // Admin login by phone (if needed)
      if (phoneNumber === '+966500000000' && password === 'admin123') {
        const payload = {
          username: 'admin@khabeer.com',
          sub: 0,
          role: 'ADMIN',
          phone: phoneNumber
        };

        const access_token = this.jwtService.sign(payload);

        return {
          success: true,
          message: 'Admin login successful',
          access_token,
          user: {
            id: 0,
            phone: phoneNumber,
            role: 'ADMIN'
          }
        };
      }

      // Find user/provider by phone number
      const user = await this.usersService.findByPhone(phoneNumber);
      const provider = await this.providersService.findByPhone(phoneNumber);

      if (!user && !provider) {
        return {
          success: false,
          message: 'No account found with this phone number'
        };
      }

      let userData: any;
      let role: string = 'USER'; // Initialize with default value

      if (user) {
        // Check if user is active (except for admins)
        if (!user.isActive && user.role !== 'ADMIN') {
          return {
            success: false,
            message: 'Account is not active'
          };
        }
        userData = user;
        role = user.role;
      } else if (provider) {
        // Check if provider is verified
        if (!provider.isVerified) {
          return {
            success: false,
            message: 'Provider account is not verified'
          };
        }
        userData = provider;
        role = 'PROVIDER';
      }

      // If password is provided, validate it
      if (password && userData.password) {
        const isPasswordValid = await bcrypt.compare(password, userData.password);
        if (!isPasswordValid) {
          return {
            success: false,
            message: 'Invalid password'
          };
        }
      }

      // Generate JWT token
      const payload = {
        username: userData.email || phoneNumber,
        sub: userData.id,
        role: role,
        phone: phoneNumber
      };

      const access_token = this.jwtService.sign(payload);

      return {
        success: true,
        message: 'Login successful',
        access_token,
        user: {
          id: userData.id,
          phone: phoneNumber,
          role: role
        }
      };

    } catch (error) {
      return {
        success: false,
        message: 'Login failed. Please try again.'
      };
    }
  }

  /**
   * Register user with phone verification (OTP optional)
   */
  async registerWithPhone(data: RegisterDto & { phoneNumber: string; otp?: string }): Promise<any> {
    try {
      const { phoneNumber, otp, ...registerData } = data;

      // If OTP is provided, verify it
      if (otp) {
        const otpResult = await this.smsService.verifyOtp({
          phoneNumber,
          otp,
          purpose: 'registration'
        });

        if (!otpResult.success) {
          throw new BadRequestException(otpResult.message);
        }
      }

      // Check if phone number is already registered
      const existingUser = await this.usersService.findByPhone(phoneNumber);
      const existingProvider = await this.providersService.findByPhone(phoneNumber);

      if (existingUser || existingProvider) {
        throw new ConflictException('Phone number is already registered');
      }

      // Add phone number to registration data
      const registrationData = {
        ...registerData,
        phone: phoneNumber
      };

      // Register user using existing method
      return this.register(registrationData);

    } catch (error) {
      if (error instanceof BadRequestException || error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Registration failed');
    }
  }

  /**
   * Reset password with phone verification
   */
  async resetPasswordWithPhone(phoneNumber: string, otp: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      // Verify OTP
      const otpResult = await this.smsService.verifyOtp({
        phoneNumber,
        otp,
        purpose: 'password_reset'
      });

      if (!otpResult.success) {
        return {
          success: false,
          message: otpResult.message
        };
      }

      // Find user/provider by phone number
      const user = await this.usersService.findByPhone(phoneNumber);
      const provider = await this.providersService.findByPhone(phoneNumber);

      if (!user && !provider) {
        return {
          success: false,
          message: 'No account found with this phone number'
        };
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      if (user) {
        await this.usersService.update(user.id, { password: hashedPassword });
      } else if (provider) {
        await this.providersService.update(provider.id, { password: hashedPassword });
      }

      return {
        success: true,
        message: 'Password reset successfully'
      };

    } catch (error) {
      return {
        success: false,
        message: 'Password reset failed'
      };
    }
  }

  /**
   * Step 1: Initiate registration and send OTP
   * User provides all registration data including password
   */
  async initiateRegistration(data: RegisterDto & { phoneNumber: string }): Promise<{ success: boolean; message: string; expiresIn?: number; registrationData?: any }> {
    try {
      const { phoneNumber, ...registerData } = data;

      // Validate required fields
      if (!registerData.password || !registerData.name) {
        throw new BadRequestException('Password and name are required');
      }

      // For providers, email is required
      if (registerData.registerType === 'provider' && !registerData.email) {
        throw new BadRequestException('Email is required for provider registration');
      }

      // Validate email format (only if email is provided)
      if (registerData.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(registerData.email)) {
          throw new BadRequestException('Invalid email format');
        }
      }

      // Validate password strength
      if (registerData.password.length < 6) {
        throw new BadRequestException('Password must be at least 6 characters long');
      }

      // Check if user already exists (only if email is provided)
      if (registerData.email) {
        const existingUser = await this.usersService.findByEmail(registerData.email);
        const existingProvider = await this.providersService.findByEmail(registerData.email);

        if (existingUser || existingProvider) {
          throw new ConflictException('User with this email already exists');
        }
      }

      // Check if phone number is already registered
      const existingUserByPhone = await this.usersService.findByPhone(phoneNumber);
      const existingProviderByPhone = await this.providersService.findByPhone(phoneNumber);

      if (existingUserByPhone || existingProviderByPhone) {
        throw new ConflictException('Phone number is already registered');
      }

      // Send OTP for registration
      const otpResult = await this.smsService.sendOtp({
        phoneNumber,
        purpose: 'registration'
      });

      if (otpResult.success) {
        // Store registration data in cache for the next step
        const dataToCache = {
          phoneNumber,
          ...registerData
        };

        this.storeRegistrationData(phoneNumber, dataToCache, 10); // Cache for 10 minutes

        return {
          success: otpResult.success,
          message: otpResult.message,
          expiresIn: otpResult.expiresIn
        };
      }

      return {
        success: false,
        message: otpResult.message
      };

    } catch (error) {
      if (error instanceof BadRequestException || error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Registration initiation failed');
    }
  }

  /**
   * Step 2: Complete registration with OTP verification
   * Only requires phone number and OTP - all other data was collected in step 1
   */
  async completeRegistration(phoneNumber: string, otp: string): Promise<any> {
    try {


      // Verify OTP
      const otpResult = await this.smsService.verifyOtp({
        phoneNumber,
        otp,
        purpose: 'registration'
      });

      if (!otpResult.success) {
        throw new BadRequestException(otpResult.message);
      }

      // Check if phone number is already registered (double-check)
      const existingUserByPhone = await this.usersService.findByPhone(phoneNumber);
      const existingProviderByPhone = await this.providersService.findByPhone(phoneNumber);

      if (existingUserByPhone || existingProviderByPhone) {
        throw new BadRequestException('Phone number is already registered');
      }

      // Retrieve registration data from cache
      const registrationData = this.getRegistrationData(phoneNumber);
      if (!registrationData) {
        throw new BadRequestException('Registration data expired or not found. Please restart the registration process.');
      }

      // Remove data from cache to prevent reuse
      this.removeRegistrationData(phoneNumber);

      // Extract registration data
      const { phoneNumber: cachedPhone, ...registerData } = registrationData;

      // Validate required fields
      if (!registerData.password || !registerData.name) {
        throw new BadRequestException('Invalid registration data. Please restart the registration process.');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(registerData.password, 10);

      // Prepare user data
      const userData = {
        name: registerData.name,
        email: registerData.email || undefined,
        password: hashedPassword,
        image: registerData.image || '',
        address: registerData.address || '',
        phone: phoneNumber,
        state: registerData.state || '',
        role: registerData.role || 'USER',
        isActive: registerData.isActive ?? true,
        officialDocuments: registerData.officialDocuments
      };

      // Create user or provider based on role
      if (registerData.role === 'PROVIDER') {
        // Create provider
        const providerData = {
          name: registerData.name,
          email: registerData.email,
          password: hashedPassword,
          image: registerData.image || '',
          description: registerData.description || '',
          state: registerData.state || '',
          phone: phoneNumber,
          isActive: registerData.isActive ?? false,
          isVerified: false,
          location: null,
          officialDocuments: registerData.officialDocuments || undefined,
          serviceIds: registerData.serviceIds || []
        };

        const provider = await this.providersService.registerProviderWithServices(providerData);

        // Return provider data without password
        const { password, ...result } = provider as any;
        return {
          ...result,
          role: 'PROVIDER',
          message: 'Provider registered successfully. Please wait for admin verification to login.'
        };
      } else {
        // Create regular user
        const user = await this.usersService.create(userData);

        // Return user data without password
        const { password, ...result } = user;
        return {
          ...result,
          role: 'USER',
          message: 'User registered successfully'
        };
      }

    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Registration completion failed');
    }
  }

  /**
   * Alternative approach: Complete registration with all data and OTP verification
   * This method combines both steps for better security
   */
  async completeRegistrationWithData(data: RegisterDto & { phoneNumber: string; otp: string }): Promise<any> {
    try {
      const { phoneNumber, otp, ...registerData } = data;



      // Verify OTP first
      const otpResult = await this.smsService.verifyOtp({
        phoneNumber,
        otp,
        purpose: 'registration'
      });

      if (!otpResult.success) {
        throw new BadRequestException(otpResult.message);
      }

      // Re-validate data (in case it was tampered with)
      if (!registerData.password || !registerData.name) {
        throw new BadRequestException('Password and name are required');
      }

      // For providers, email is required
      if (registerData.registerType === 'provider' && !registerData.email) {
        throw new BadRequestException('Email is required for provider registration');
      }

      // Check if user already exists (double-check, only if email is provided)
      if (registerData.email) {
        const existingUser = await this.usersService.findByEmail(registerData.email);
        const existingProvider = await this.providersService.findByEmail(registerData.email);

        if (existingUser || existingProvider) {
          throw new ConflictException('User with this email already exists');
        }
      }

      // Check if phone number is already registered (double-check)
      const existingUserByPhone = await this.usersService.findByPhone(phoneNumber);
      const existingProviderByPhone = await this.providersService.findByPhone(phoneNumber);

      if (existingUserByPhone || existingProviderByPhone) {
        throw new ConflictException('Phone number is already registered');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(registerData.password, 10);

      // Prepare user data
      const userData = {
        name: registerData.name,
        email: registerData.email || undefined, // Optional for users
        password: hashedPassword,
        image: registerData.image || '',
        address: registerData.address || '',
        phone: phoneNumber, // Use the phone number from the request
        state: registerData.state || '',
        role: registerData.role || 'USER',
        isActive: registerData.isActive ?? true,
        officialDocuments: registerData.officialDocuments
      };

      // Create user or provider based on role
      if (registerData.role === 'PROVIDER') {
        // Create provider
        const providerData = {
          name: registerData.name,
          email: registerData.email,
          password: hashedPassword,
          image: registerData.image || '',
          description: registerData.description || '',
          state: registerData.state || '',
          phone: phoneNumber,
          isActive: registerData.isActive ?? false, // Providers start as inactive
          isVerified: false,
          location: null,
          officialDocuments: registerData.officialDocuments || undefined,
          serviceIds: registerData.serviceIds || []
        };

        const provider = await this.providersService.registerProviderWithServices(providerData);

        // Return provider data without password
        const { password, ...result } = provider as any;
        return {
          ...result,
          role: 'PROVIDER',
          message: 'Provider registered successfully. Please wait for admin verification to login.'
        };
      } else {
        // Create regular user
        const user = await this.usersService.create(userData);

        // Return user data without password
        const { password, ...result } = user;
        return {
          ...result,
          role: 'USER',
          message: 'User registered successfully'
        };
      }

    } catch (error) {
      if (error instanceof BadRequestException || error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Registration completion failed');
    }
  }

  /**
   * Check if registration data exists for a phone number
   * Useful for frontend to know if step 1 was completed
   */
  async checkRegistrationStatus(phoneNumber: string): Promise<{ exists: boolean; expiresIn?: number; message: string }> {
    try {
      const registrationData = this.getRegistrationData(phoneNumber);

      if (!registrationData) {
        return {
          exists: false,
          message: 'No registration data found for this phone number'
        };
      }

      // Calculate remaining time
      const cached = this.registrationCache[phoneNumber];
      const remainingTime = Math.max(0, Math.ceil((cached.expiresAt - Date.now()) / 1000 / 60)); // in minutes

      return {
        exists: true,
        expiresIn: remainingTime,
        message: `Registration data exists and expires in ${remainingTime} minutes`
      };
    } catch (error) {
      return {
        exists: false,
        message: 'Error checking registration status'
      };
    }
  }

  /**
   * Clear expired registration data for a phone number
   * Useful for cleanup or when user wants to restart registration
   */
  async clearRegistrationData(phoneNumber: string): Promise<{ success: boolean; message: string }> {
    try {
      this.removeRegistrationData(phoneNumber);
      return {
        success: true,
        message: 'Registration data cleared successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error clearing registration data'
      };
    }
  }
}


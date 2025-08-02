import { Injectable, UnauthorizedException, BadRequestException, ConflictException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { ProvidersService } from '../providers/providers.service';
import { SmsService } from '../sms/sms.service';
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from './dto/register.dto';
import { PhoneLoginDto, PhoneLoginVerifyDto, PhoneLoginResponseDto } from './dto/phone-login.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly providersService: ProvidersService,
    private readonly smsService: SmsService,
    private readonly jwtService: JwtService,
  ) { }

  async validateUser(email: string, pass: string): Promise<any> {
    try {
      // Check both users and providers tables simultaneously
      const [user, provider] = await Promise.all([
        this.usersService.findByEmail(email),
        this.providersService.findByEmail(email)
      ]);

      // If email exists in both tables, prioritize provider for provider-specific logic
      if (user && provider) {
        // Check provider first if password matches
        if (provider.password && provider.password.trim() !== '' && await bcrypt.compare(pass, provider.password)) {
          // Check if provider is verified
          if (!provider.isVerified) {
            throw new UnauthorizedException('Your account is not verified. Please wait for admin verification.');
          }
          const { password, ...result } = provider;
          return { ...result, role: 'PROVIDER' };
        }

        // If provider password doesn't match, check user password
        if (user.password && await bcrypt.compare(pass, user.password)) {
          const { password, ...result } = user;
          return { ...result, role: user.role };
        }
      } else if (user && await bcrypt.compare(pass, user.password)) {
        // Only user exists and password matches
        const { password, ...result } = user;
        return { ...result, role: user.role };
      } else if (provider && provider.password && provider.password.trim() !== '' && await bcrypt.compare(pass, provider.password)) {
        // Only provider exists and password matches
        if (!provider.isVerified) {
          throw new UnauthorizedException('Your account is not verified. Please wait for admin verification.');
        }
        const { password, ...result } = provider;
        return { ...result, role: 'PROVIDER' };
      }

      // If we get here, either the email doesn't exist or password is wrong
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

  async login(user: { id: number; email: string; role: string }) {
    try {
      const payload = { username: user.email, sub: user.id, role: user.role };
      return {
        access_token: this.jwtService.sign(payload),
        user: {
          id: user.id,
          email: user.email,
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
      if (!data.email || !data.password || !data.name) {
        throw new BadRequestException('Email, password, and name are required');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        throw new BadRequestException('Invalid email format');
      }

      // Validate password strength
      if (data.password.length < 6) {
        throw new BadRequestException('Password must be at least 6 characters long');
      }

      // Check if user already exists (in either users or providers table)
      const existingUser = await this.usersService.findByEmail(data.email);
      const existingProvider = await this.providersService.findByEmail(data.email);

      if (existingUser || existingProvider) {
        throw new ConflictException('User with this email already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, 10);

      // Prepare user data - only include fields that CreateUserDto expects
      const userData = {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        image: data.image || '',
        address: data.address || '',
        phone: data.phone || '',
        state: data.state || '',
        role: data.role || 'USER',
        isActive: data.isActive ?? true,
        officialDocuments: data.officialDocuments
      };

      // Create user or provider based on role
      if (data.role === 'PROVIDER') {
        // Create provider
        const providerData = {
          name: data.name,
          email: data.email,
          password: hashedPassword,
          image: data.image || '',
          description: data.description || '',
          state: data.state || '',
          phone: data.phone || '',
          isActive: data.isActive ?? false, // Providers start as inactive
          isVerified: false,
          location: null,
          officialDocuments: data.officialDocuments || undefined,
          serviceIds: data.serviceIds || [] // Include service IDs for linking
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
            if (error.meta?.target && Array.isArray(error.meta.target) && error.meta.target.includes('email')) {
              throw new ConflictException('User with this email already exists');
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

      // Check if provider with this email already exists
      const existingProvider = await this.providersService.findByEmail(user.email);
      if (existingProvider) {
        throw new ConflictException('Provider with this email already exists');
      }

      // Create provider from user data
      const newProvider = await this.providersService.create({
        name: user.name,
        email: user.email,
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

  async checkAccountStatus(email: string) {
    try {
      // Check if it's a user
      const user = await this.usersService.findByEmail(email);
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

      // Check if it's a provider
      const provider = await this.providersService.findByEmail(email);
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
      console.log('Attempting to activate provider with ID:', providerId);

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
      console.log('Attempting to deactivate provider with ID:', providerId);

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
   * Send OTP for phone-based login
   */
  async sendPhoneLoginOtp(phoneLoginDto: PhoneLoginDto): Promise<{ success: boolean; message: string; expiresIn?: number }> {
    try {
      const { phoneNumber, purpose = 'login' } = phoneLoginDto;

      // Check if user/provider exists with this phone number
      const user = await this.usersService.findByPhone(phoneNumber);
      const provider = await this.providersService.findByPhone(phoneNumber);

      if (!user && !provider) {
        // For registration, allow sending OTP
        if (purpose === 'registration') {
          return this.smsService.sendOtp({ phoneNumber, purpose });
        }
        throw new NotFoundException('No account found with this phone number');
      }

      // For login, check if account is active
      if (purpose === 'login') {
        if (user && !user.isActive && user.role !== 'ADMIN') {
          throw new UnauthorizedException('Account is not active');
        }
        if (provider && !provider.isVerified) {
          throw new UnauthorizedException('Provider account is not verified');
        }
      }

      // Send OTP
      return this.smsService.sendOtp({ phoneNumber, purpose });

    } catch (error) {
      if (error instanceof NotFoundException || error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to send OTP');
    }
  }

  /**
   * Verify OTP and login user
   */
  async verifyPhoneLogin(phoneLoginVerifyDto: PhoneLoginVerifyDto): Promise<PhoneLoginResponseDto> {
    try {
      const { phoneNumber, otp, purpose = 'login' } = phoneLoginVerifyDto;

      // Verify OTP
      const otpResult = await this.smsService.verifyOtp({ phoneNumber, otp, purpose });
      
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

      let userData: any;
      let role: string;

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
   * Register user with phone verification
   */
  async registerWithPhone(data: RegisterDto & { phoneNumber: string; otp: string }): Promise<any> {
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
}

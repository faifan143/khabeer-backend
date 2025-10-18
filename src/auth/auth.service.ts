import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import * as bcrypt from 'bcryptjs';
import { ProvidersService } from '../providers/providers.service';
import { SmsService } from '../sms/sms.service';
import { UsersService } from '../users/users.service';
import {
  DirectPhoneLoginDto,
  PhoneLoginDto,
  PhoneLoginResponseDto,
} from './dto/phone-login.dto';
import { RegisterDto, RegisterType } from './dto/register.dto';
import { PrismaService } from '../prisma/prisma.service';

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
    private readonly prisma: PrismaService,
  ) {}

  async getTermsAndConditions() {
    const terms = await this.prisma.systemSettings.findUnique({
      where: {
        key: 'terms_and_conditions',
      },
    });
    return {
      terms: terms?.value,
      privacy: terms?.value,
    };
  }

  /**
   * Store registration data in cache with expiration
   */
  private storeRegistrationData(
    phoneNumber: string,
    data: any,
    expiresInMinutes: number = 50,
  ): void {
    const expiresAt = Date.now() + expiresInMinutes * 60 * 1000;

    this.registrationCache[phoneNumber] = {
      data,
      expiresAt,
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
    Object.keys(this.registrationCache).forEach((phoneNumber) => {
      if (this.registrationCache[phoneNumber].expiresAt < now) {
        delete this.registrationCache[phoneNumber];
      }
    });
  }

  async validateUser(loginData: {
    email?: string;
    phone: string;
    password: string;
    type: 'USER' | 'PROVIDER';
  }): Promise<any> {
    try {
      const { email, phone, password, type } = loginData;

      // Admin login - hardcoded credentials
      if (email === 'admin@khabeer.com' && password === 'admin123') {
        return {
          id: 0,
          email: 'admin@khabeer.com',
          name: 'System Administrator',
          role: 'ADMIN',
          isActive: true,
          isVerified: true,
        };
      }

      // SubAdmin login - check database (email provided and no phone or empty phone)
      if (email && (!phone || phone === '')) {
        const subAdmin = await this.prisma.subAdmin.findUnique({
          where: { email },
        });

        if (subAdmin) {
          // Use bcrypt to compare password
          const isPasswordValid = await bcrypt.compare(
            password,
            subAdmin.password,
          );

          if (isPasswordValid) {
            // Check if subadmin is active
            if (!subAdmin.isActive) {
              throw new ForbiddenException(
                'Your subadmin account is not active. Please contact support to activate your account.',
              );
            }

            const permissions = JSON.parse(subAdmin.permissions as string);
            return {
              id: subAdmin.id,
              email: subAdmin.email,
              name: subAdmin.name,
              role: 'ADMIN', // Return ADMIN role for subadmins
              permissions: permissions,
              isActive: subAdmin.isActive,
              isVerified: true,
              phone: null, // Subadmins don't have phone
              state: null, // Subadmins don't have state
            };
          }
        }
      }

      // Type-based validation for USER and PROVIDER accounts (both login by phone)
      if (type === 'PROVIDER') {
        // Provider login - by phone only
        const provider =
          await this.providersService.findByPhoneWithPassword(phone);

        if (provider && provider.password) {
          const isPasswordValid = await bcrypt.compare(
            password,
            provider.password,
          );

          if (isPasswordValid) {
            // Check if provider is verified
            if (!provider.isVerified) {
              throw new UnauthorizedException(
                'Your account is not verified. Please wait for admin verification.',
              );
            }
            // Check if provider is active
            if (!provider.isActive) {
              throw new ForbiddenException(
                'Your account is not active. Please contact support to activate your account.',
              );
            }
            const { password: _, ...result } = provider;
            return { ...result, role: 'PROVIDER' };
          }
        }
      } else if (type === 'USER') {
        // User login - by phone only
        const user = await this.usersService.findByPhoneWithPassword(phone);
        if (user && (await bcrypt.compare(password, user.password))) {
          // Check if user is active
          if (!user.isActive) {
            throw new ForbiddenException(
              'Your account is not active. Please contact support to activate your account.',
            );
          }
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
      if (error instanceof ForbiddenException) {
        throw error;
      }
      // Log other errors and throw a generic error
      console.error('Authentication error:', error);
      throw new InternalServerErrorException(
        'Error validating user credentials',
      );
    }
  }

  async login(user: {
    id: number;
    email?: string;
    phone?: string;
    role: string;
    state?: string;
    permissions?: string[];
    name?: string;
  }) {
    try {
      const username = user.email || user.phone;
      const payload = {
        username,
        sub: user.id,
        role: user.role,
        phone: user.phone,
        state: user.state,
        permissions: user.permissions || [],
      };

      // Determine if user is super admin
      const isSuperAdmin = user.email === 'admin@khabeer.com';

      const result = {
        access_token: this.jwtService.sign(payload),
        user: {
          id: user.id,
          email: user.email,
          phone: user.phone,
          role: user.role,
          state: user.state,
          permissions: user.permissions || [],
          name: user.name || null,
        },
        isSuperAdmin: isSuperAdmin,
        permissions: isSuperAdmin ? [] : user.permissions || [],
      };
      return result;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error generating authentication token',
      );
    }
  }

  async loginWithFCM(
    user: {
      id: number;
      email?: string;
      phone?: string;
      role: string;
      state?: string;
      permissions?: string[];
      name?: string;
    },
    fcmToken?: string,
  ) {
    try {
      // Update FCM token if provided
      if (fcmToken) {
        if (user.role === 'PROVIDER') {
          await this.providersService.updateFCMToken(user.id, fcmToken);
        } else if (user.role === 'USER') {
          await this.usersService.updateFCMToken(user.id, fcmToken);
        }
        // Note: SubAdmins don't have FCM token support in the current system
      }

      const username = user.email || user.phone;
      const payload = {
        username,
        sub: user.id,
        role: user.role,
        phone: user.phone,
        state: user.state,
        permissions: user.permissions || [],
      };
      // Determine if user is super admin
      const isSuperAdmin = user.email === 'admin@khabeer.com';

      return {
        access_token: this.jwtService.sign(payload),
        user: {
          id: user.id,
          email: user.email,
          phone: user.phone,
          role: user.role,
          state: user.state,
          permissions: user.permissions || [],
          name: user.name || null,
        },
        isSuperAdmin: isSuperAdmin,
        permissions: isSuperAdmin ? [] : user.permissions || [],
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Error generating authentication token',
      );
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
        throw new BadRequestException(
          'Password must be at least 6 characters long',
        );
      }

      if (data.registerType === 'provider') {
        // Email is optional for providers
        // Validate email format only if email is provided
        if (data.email) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(data.email)) {
            throw new BadRequestException('Invalid email format');
          }
        }

        // Check if provider already exists (only if email is provided)
        if (data.email) {
          const existingProvider = await this.providersService.findByEmail(
            data.email,
          );
          if (existingProvider) {
            throw new ConflictException(
              'Provider with this email already exists',
            );
          }
        }
      } else {
        // User registration - phone is required
        if (!data.phone) {
          throw new BadRequestException(
            'Phone number is required for user registration',
          );
        }

        // Check if user already exists with this phone
        const existingUser = await this.usersService.findByPhone(data.phone);
        if (existingUser) {
          throw new ConflictException(
            'User with this phone number already exists',
          );
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
        fcm: data.fcm || undefined, // Include FCM token
      };

      // Create user or provider based on role
      if (data.role === 'PROVIDER') {
        // Create provider
        const providerData = {
          name: data.name,
          email: data.email || undefined, // Email is optional for providers
          password: hashedPassword,
          image: data.image || '',
          description: data.description || '',
          state: data.state || '',
          phone: data.phone || '',
          isActive: data.isActive ?? true, // Providers start as inactive
          isVerified: false,
          location: null,
          officialDocuments: data.officialDocuments || undefined,
          categoryIds:
            (data as any).categoryIds?.map((id: any) => Number(id)) || [], // Include categories for linking
          fcm: data.fcm || undefined, // Include FCM token
        };

        const provider =
          await this.providersService.registerProviderWithCategories(
            providerData,
          );

        // Return provider data without password
        const { password, ...result } = provider as any;
        return {
          ...result,
          role: 'PROVIDER',
          message:
            'Provider registered successfully. Please wait for admin verification to login.',
        };
      } else {
        // Create regular user
        const user = await this.usersService.create(userData);

        // User is already returned without password from the service
        return {
          ...user,
          role: 'USER',
          message: 'User registered successfully',
        };
      }
    } catch (error) {
      // Handle Prisma-specific errors
      if (error instanceof PrismaClientKnownRequestError) {
        switch (error.code) {
          case 'P2002':
            if (error.meta?.target && Array.isArray(error.meta.target)) {
              if (error.meta.target.includes('email')) {
                throw new ConflictException(
                  'Provider with this email already exists',
                );
              } else if (error.meta.target.includes('phone')) {
                throw new ConflictException(
                  'User with this phone number already exists',
                );
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
      if (
        error instanceof BadRequestException ||
        error instanceof ConflictException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }

      // Handle unexpected errors
      console.error('Registration error:', error);
      throw new InternalServerErrorException(
        'Registration failed. Please try again.',
      );
    }
  }

  async upgradeToProvider(userId: number, providerData: any) {
    try {
      // Get the existing user with password
      const user = await this.usersService.findByIdWithPassword(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Check if provider with this email already exists (if user has email)
      if (user.email) {
        const existingProvider = await this.providersService.findByEmail(
          user.email,
        );
        if (existingProvider) {
          throw new ConflictException(
            'Provider with this email already exists',
          );
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
        isActive: true, // Start as inactive
        isVerified: false,
        location: null,
        officialDocuments: providerData.officialDocuments || null,
      });

      // Optionally deactivate the user account
      // await this.usersService.update(userId, { isActive: false });

      return {
        ...newProvider,
        role: 'PROVIDER',
        message:
          'Account upgraded to provider successfully. Please wait for admin approval.',
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error upgrading account to provider',
      );
    }
  }

  async checkAccountStatus(
    identifier: string,
    type: 'email' | 'phone' = 'email',
  ) {
    try {
      // Check for admin account first
      if (
        identifier === 'admin@khabeer.com' ||
        identifier === '+966500000000'
      ) {
        return {
          exists: true,
          type: 'ADMIN',
          isActive: true, // Admins are always active
          isVerified: true, // Admins are always verified
          message: 'Admin account is active and verified.',
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
            message: !provider.isVerified
              ? 'Account is not verified. Please wait for admin verification.'
              : !provider.isActive
                ? 'Account is verified but currently inactive. You can activate it to accept orders.'
                : 'Account is verified and active.',
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
              message: 'Admin account is active and verified.',
            };
          } else {
            return {
              exists: true,
              type: 'USER',
              isActive: user.isActive,
              isVerified: true, // Regular users don't need verification
              message:
                'User account is ready to use. isActive status does not affect login.',
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
              message: 'Admin account is active and verified.',
            };
          } else {
            return {
              exists: true,
              type: 'USER',
              isActive: user.isActive,
              isVerified: true, // Regular users don't need verification
              message:
                'User account is ready to use. isActive status does not affect login.',
            };
          }
        }
      }

      return {
        exists: false,
        message: 'Account not found',
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
        throw new BadRequestException(
          'Your account must be verified by admin before you can activate it.',
        );
      }

      const updatedProvider = await this.providersService.update(provider.id, {
        isActive: true,
      });
      return {
        ...updatedProvider,
        message: 'Account activated successfully. You can now accept orders.',
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
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

      const updatedProvider = await this.providersService.update(provider.id, {
        isActive: false,
      });
      return {
        ...updatedProvider,
        message:
          'Account deactivated successfully. You will not receive new orders.',
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
  async sendPhoneLoginOtp(
    phoneLoginDto: PhoneLoginDto,
  ): Promise<{ success: boolean; message: string; expiresIn?: number }> {
    try {
      const { phoneNumber, purpose = 'registration' } = phoneLoginDto;

      // Check if phone number is already registered (for registration)
      if (purpose === 'registration') {
        const existingUser = await this.usersService.findByPhone(phoneNumber);
        const existingProvider =
          await this.providersService.findByPhone(phoneNumber);

        if (existingUser || existingProvider) {
          return {
            success: false,
            message: 'Phone number is already registered',
          };
        }
      }

      // Send OTP
      const result = await this.smsService.sendOtp({ phoneNumber, purpose });

      return {
        success: result.success,
        message: result.message,
        expiresIn: result.expiresIn,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to send OTP',
      };
    }
  }

  /**
   * Send OTP specifically for password reset
   */
  async sendPasswordResetOtp(
    phoneNumber: string,
    role: string,
  ): Promise<{ success: boolean; message: string; expiresIn?: number }> {
    try {
      // Handle admin password reset
      if (role === 'ADMIN') {
        if (phoneNumber === '+966500000000') {
          // Send OTP for admin password reset
          const result = await this.smsService.sendOtp({
            phoneNumber,
            purpose: 'password_reset',
          });

          return {
            success: result.success,
            message: result.message,
            expiresIn: result.expiresIn,
          };
        } else {
          return {
            success: false,
            message: 'Admin account not found with this phone number',
          };
        }
      }

      // Role-based account validation
      if (role === 'USER') {
        // Users cannot have provider accounts, only check for user account
        const user = await this.usersService.findByPhone(phoneNumber);
        if (!user) {
          return {
            success: false,
            message: 'No user account found with this phone number',
          };
        }
      } else if (role === 'PROVIDER') {
        // Providers can have user accounts, but we're resetting provider password
        const provider = await this.providersService.findByPhone(phoneNumber);
        if (!provider) {
          return {
            success: false,
            message: 'No provider account found with this phone number',
          };
        }
      } else {
        return {
          success: false,
          message: 'Invalid role specified',
        };
      }

      // Send OTP for password reset
      const result = await this.smsService.sendOtp({
        phoneNumber,
        purpose: 'password_reset',
      });

      return {
        success: result.success,
        message: result.message,
        expiresIn: result.expiresIn,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to send password reset OTP',
      };
    }
  }

  /**
   * Phone login without OTP (main login method)
   */
  async phoneLogin(
    directPhoneLoginDto: DirectPhoneLoginDto,
  ): Promise<PhoneLoginResponseDto> {
    try {
      const { phoneNumber, password } = directPhoneLoginDto;

      // Admin login by phone (if needed)
      if (phoneNumber === '+966500000000' && password === 'admin123') {
        const payload = {
          username: 'admin@khabeer.com',
          sub: 0,
          role: 'ADMIN',
          phone: phoneNumber,
          state: 'Muscat', // Admin state
        };

        const access_token = this.jwtService.sign(payload);

        return {
          success: true,
          message: 'Admin login successful',
          access_token,
          user: {
            id: 0,
            phone: phoneNumber,
            role: 'ADMIN',
            state: 'Muscat',
          } as any,
        };
      }

      // Find user/provider by phone number
      const user = await this.usersService.findByPhone(phoneNumber);
      const provider = await this.providersService.findByPhone(phoneNumber);

      if (!user && !provider) {
        return {
          success: false,
          message: 'No account found with this phone number',
        };
      }

      let userData: any;
      let role: string = 'USER'; // Initialize with default value

      if (user) {
        // Check if user is active (except for admins)
        if (!user.isActive && user.role !== 'ADMIN') {
          return {
            success: false,
            message:
              'Account is not active. Please contact support to activate your account.',
          };
        }
        userData = user;
        role = user.role;
      } else if (provider) {
        // Check if provider is verified
        if (!provider.isVerified) {
          return {
            success: false,
            message:
              'Provider account is not verified. Please wait for admin verification.',
          };
        }
        // Check if provider is active
        if (!provider.isActive) {
          return {
            success: false,
            message:
              'Provider account is not active. Please contact support to activate your account.',
          };
        }
        userData = provider;
        role = 'PROVIDER';
      }

      // If password is provided, validate it
      if (password && userData.password) {
        const isPasswordValid = await bcrypt.compare(
          password,
          userData.password,
        );
        if (!isPasswordValid) {
          return {
            success: false,
            message: 'Invalid password',
          };
        }
      }

      // Generate JWT token
      const payload = {
        username: userData.email || phoneNumber,
        sub: userData.id,
        role: role,
        phone: phoneNumber,
        state: userData.state,
      };

      const access_token = this.jwtService.sign(payload);

      return {
        success: true,
        message: 'Login successful',
        access_token,
        user: {
          id: userData.id,
          phone: phoneNumber,
          role: role,
          state: userData.state,
        } as any,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Login failed. Please try again.',
      };
    }
  }

  /**
   * Register user with phone verification (OTP optional)
   */
  async registerWithPhone(
    data: RegisterDto & { phoneNumber: string; otp?: string },
  ): Promise<any> {
    try {
      const { phoneNumber, otp, ...registerData } = data;

      // If OTP is provided, verify it
      if (otp) {
        const otpResult = await this.smsService.verifyOtp({
          phoneNumber,
          otp,
          purpose: 'registration',
        });

        if (!otpResult.success) {
          throw new BadRequestException(otpResult.message);
        }
      }

      // Check if phone number is already registered
      const existingUser = await this.usersService.findByPhone(phoneNumber);
      const existingProvider =
        await this.providersService.findByPhone(phoneNumber);

      if (existingUser || existingProvider) {
        throw new ConflictException('Phone number is already registered');
      }

      // Add phone number to registration data
      const registrationData = {
        ...registerData,
        phone: phoneNumber,
      };

      // Register user using existing method
      return this.register(registrationData);
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Registration failed');
    }
  }

  /**
   * Reset password with phone verification
   */
  async resetPasswordWithPhone(
    phoneNumber: string,
    otp: string,
    newPassword: string,
    role: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Verify OTP
      const otpResult = await this.smsService.verifyOtp({
        phoneNumber,
        otp,
        purpose: 'password_reset',
      });

      if (!otpResult.success) {
        return {
          success: false,
          message: otpResult.message,
        };
      }

      // Handle admin password reset
      if (role === 'ADMIN') {
        if (phoneNumber === '+966500000000') {
          // For admin, we don't actually update a database record
          // The admin password is hardcoded in the login logic
          return {
            success: true,
            message: 'Admin password reset successful. Please use the default admin credentials.',
          };
        } else {
          return {
            success: false,
            message: 'Admin account not found with this phone number',
          };
        }
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Role-based password reset
      if (role === 'USER') {
        // Users cannot have provider accounts, only reset user password
        const user = await this.usersService.findByPhone(phoneNumber);
        if (!user) {
          return {
            success: false,
            message: 'No user account found with this phone number',
          };
        }
        await this.usersService.update(user.id, { password: hashedPassword });
      } else if (role === 'PROVIDER') {
        // Providers can have user accounts, but we're resetting provider password
        const provider = await this.providersService.findByPhone(phoneNumber);
        if (!provider) {
          return {
            success: false,
            message: 'No provider account found with this phone number',
          };
        }
        await this.providersService.update(provider.id, {
          password: hashedPassword,
        });
      } else {
        return {
          success: false,
          message: 'Invalid role specified',
        };
      }

      return {
        success: true,
        message: 'Password reset successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Password reset failed',
      };
    }
  }

  /**
   * Step 1: Initiate registration and send OTP
   * User provides all registration data including password
   */
  async initiateRegistration(
    data: RegisterDto & { phoneNumber: string },
  ): Promise<{
    success: boolean;
    message: string;
    expiresIn?: number;
    registrationData?: any;
  }> {
    try {
      const { phoneNumber, ...registerData } = data;

      // Normalize phone number - add + prefix if missing
      const normalizedPhoneNumber = phoneNumber.startsWith('+')
        ? phoneNumber
        : `+${phoneNumber}`;

      // Validate required fields
      if (!registerData.password || !registerData.name) {
        throw new BadRequestException('Password and name are required');
      }

      // Email is optional for providers

      // Validate email format (only if email is provided)
      if (registerData.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(registerData.email)) {
          throw new BadRequestException('Invalid email format');
        }
      }

      // Validate password strength
      if (registerData.password.length < 6) {
        throw new BadRequestException(
          'Password must be at least 6 characters long',
        );
      }

      // Check if user already exists (only if email is provided)
      if (registerData.email) {
        const existingUser = await this.usersService.findByEmail(
          registerData.email,
        );
        const existingProvider = await this.providersService.findByEmail(
          registerData.email,
        );

        if (existingUser || existingProvider) {
          throw new ConflictException('User with this email already exists');
        }
      }

      // Check if phone number is already registered and apply business rules
      const existingUserByPhone = await this.usersService.findByPhone(
        normalizedPhoneNumber,
      );
      const existingProviderByPhone = await this.providersService.findByPhone(
        normalizedPhoneNumber,
      );

      // Business rule: Providers can register as users, but users cannot register as providers
      if (registerData.registerType === RegisterType.PROVIDER) {
        // If trying to register as provider, check if phone already exists as user
        if (existingUserByPhone) {
          throw new ConflictException(
            'This phone number is already registered as a user. Users cannot register as providers.',
          );
        }
        // If phone exists as provider, don't allow duplicate provider registration
        if (existingProviderByPhone) {
          throw new ConflictException(
            'Phone number is already registered as a provider',
          );
        }
      } else if (registerData.registerType === RegisterType.USER) {
        // If trying to register as user, check if phone already exists as user
        if (existingUserByPhone) {
          throw new ConflictException(
            'Phone number is already registered as a user',
          );
        }
        // If phone exists as provider, allow user registration (providers can have user accounts)
        // This case is allowed, so we don't throw an error
      }

      // Send OTP for registration
      const otpResult = await this.smsService.sendOtp({
        phoneNumber: normalizedPhoneNumber,
        purpose: 'registration',
      });

      if (otpResult.success) {
        // Store registration data in cache for the next step
        const dataToCache = {
          phoneNumber: normalizedPhoneNumber,
          ...registerData,
        };

        this.storeRegistrationData(normalizedPhoneNumber, dataToCache, 10); // Cache for 10 minutes

        return {
          success: otpResult.success,
          message: otpResult.message,
          expiresIn: otpResult.expiresIn,
        };
      }

      return {
        success: false,
        message: otpResult.message,
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
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
      // Normalize phone number - add + prefix if missing
      const normalizedPhoneNumber = phoneNumber.startsWith('+')
        ? phoneNumber
        : `+${phoneNumber}`;

      // Verify OTP
      const otpResult = await this.smsService.verifyOtp({
        phoneNumber: normalizedPhoneNumber,
        otp,
        purpose: 'registration',
      });

      if (!otpResult.success) {
        throw new BadRequestException(otpResult.message);
      }

      // Check if phone number is already registered (double-check with business rules)
      const existingUserByPhone = await this.usersService.findByPhone(
        normalizedPhoneNumber,
      );
      const existingProviderByPhone = await this.providersService.findByPhone(
        normalizedPhoneNumber,
      );

      // Get registration data to check the intended registration type
      const registrationData = this.getRegistrationData(normalizedPhoneNumber);
      if (!registrationData) {
        throw new BadRequestException(
          'Registration data expired or not found. Please restart the registration process.',
        );
      }

      // Apply business rules based on registration type
      if (registrationData.registerType === RegisterType.PROVIDER) {
        // If trying to register as provider, check if phone already exists as user
        if (existingUserByPhone) {
          throw new BadRequestException(
            'This phone number is already registered as a user. Users cannot register as providers.',
          );
        }
        // If phone exists as provider, don't allow duplicate provider registration
        if (existingProviderByPhone) {
          throw new BadRequestException(
            'Phone number is already registered as a provider',
          );
        }
      } else if (registrationData.registerType === RegisterType.USER) {
        // If trying to register as user, check if phone already exists as user
        if (existingUserByPhone) {
          throw new BadRequestException(
            'Phone number is already registered as a user',
          );
        }
        // If phone exists as provider, allow user registration (providers can have user accounts)
        // This case is allowed, so we don't throw an error
      }

      // Registration data already retrieved above, continue with the process

      // Remove data from cache to prevent reuse
      this.removeRegistrationData(normalizedPhoneNumber);

      // Extract registration data
      const { phoneNumber: cachedPhone, ...registerData } = registrationData;

      // Validate required fields
      if (!registerData.password || !registerData.name) {
        throw new BadRequestException(
          'Invalid registration data. Please restart the registration process.',
        );
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
        phone: normalizedPhoneNumber,
        state: registerData.state || '',
        role: registerData.role || 'USER',
        isActive: registerData.isActive ?? true,
        officialDocuments: registerData.officialDocuments,
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
          phone: normalizedPhoneNumber,
          isActive: registerData.isActive ?? true,
          isVerified: false,
          location: null,
          officialDocuments: registerData.officialDocuments || undefined,
          categoryIds:
            (registerData as any).categoryIds?.map((id: any) => Number(id)) ||
            [],
        };

        const provider =
          await this.providersService.registerProviderWithCategories(
            providerData,
          );

        // Return provider data without password
        const { password, ...result } = provider as any;
        return {
          ...result,
          role: 'PROVIDER',
          message:
            'Provider registered successfully. Please wait for admin verification to login.',
        };
      } else {
        // Create regular user
        const user = await this.usersService.create(userData);
        const payload = {
          username: user.name,
          sub: user.id,
          role: user.role,
          phone: phoneNumber,
          state: user.state,
        };
        // User is already returned without password from the service
        return {
          user: {
            ...user,
            role: 'USER',
          },
          message: 'User registered successfully',
          success: true,
          access_token: this.jwtService.sign(payload),
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
  async completeRegistrationWithData(
    data: RegisterDto & { phoneNumber: string; otp: string },
  ): Promise<any> {
    try {
      const { phoneNumber, otp, ...registerData } = data;

      // Verify OTP first
      const otpResult = await this.smsService.verifyOtp({
        phoneNumber,
        otp,
        purpose: 'registration',
      });

      if (!otpResult.success) {
        throw new BadRequestException(otpResult.message);
      }

      // Re-validate data (in case it was tampered with)
      if (!registerData.password || !registerData.name) {
        throw new BadRequestException('Password and name are required');
      }

      // Email is optional for providers

      // Check if user already exists (double-check, only if email is provided)
      if (registerData.email) {
        const existingUser = await this.usersService.findByEmail(
          registerData.email,
        );
        const existingProvider = await this.providersService.findByEmail(
          registerData.email,
        );

        if (existingUser || existingProvider) {
          throw new ConflictException('User with this email already exists');
        }
      }

      // Check if phone number is already registered (double-check)
      const existingUserByPhone =
        await this.usersService.findByPhone(phoneNumber);
      const existingProviderByPhone =
        await this.providersService.findByPhone(phoneNumber);

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
        officialDocuments: registerData.officialDocuments,
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
          isActive: registerData.isActive ?? true, // Providers start as inactive
          isVerified: false,
          location: null,
          officialDocuments: registerData.officialDocuments || undefined,
          categoryIds:
            (registerData as any).categoryIds?.map((id: any) => Number(id)) ||
            [],
        };

        console.log('🔍 Provider registration data:', {
          name: providerData.name,
          categoryIds: providerData.categoryIds,
          categoryIdsCount: providerData.categoryIds?.length || 0,
        });

        const provider =
          await this.providersService.registerProviderWithCategories(
            providerData,
          );

        // Return provider data without password
        const { password, ...result } = provider as any;
        return {
          ...result,
          role: 'PROVIDER',
          message:
            'Provider registered successfully. Please wait for admin verification to login.',
        };
      } else {
        // Create regular user
        const user = await this.usersService.create(userData);

        // User is already returned without password from the service
        return {
          ...user,
          role: 'USER',
          message: 'User registered successfully',
        };
      }
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Registration completion failed');
    }
  }

  /**
   * Check if registration data exists for a phone number
   * Useful for frontend to know if step 1 was completed
   */
  async checkRegistrationStatus(
    phoneNumber: string,
  ): Promise<{ exists: boolean; expiresIn?: number; message: string }> {
    try {
      const registrationData = this.getRegistrationData(phoneNumber);

      if (!registrationData) {
        return {
          exists: false,
          message: 'No registration data found for this phone number',
        };
      }

      // Calculate remaining time
      const cached = this.registrationCache[phoneNumber];
      const remainingTime = Math.max(
        0,
        Math.ceil((cached.expiresAt - Date.now()) / 1000 / 60),
      ); // in minutes

      return {
        exists: true,
        expiresIn: remainingTime,
        message: `Registration data exists and expires in ${remainingTime} minutes`,
      };
    } catch (error) {
      return {
        exists: false,
        message: 'Error checking registration status',
      };
    }
  }

  /**
   * Clear expired registration data for a phone number
   * Useful for cleanup or when user wants to restart registration
   */
  async clearRegistrationData(
    phoneNumber: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      this.removeRegistrationData(phoneNumber);
      return {
        success: true,
        message: 'Registration data cleared successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error clearing registration data',
      };
    }
  }

  /**
   * Logout user by clearing FCM token
   */
  async logout(
    userId: number,
    userRole: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      if (userRole === 'PROVIDER') {
        await this.providersService.updateFCMToken(userId, '');
      } else if (userRole === 'USER') {
        await this.usersService.updateFCMToken(userId, '');
      }

      return {
        success: true,
        message: 'Logged out successfully',
      };
    } catch (error) {
      console.error('Logout error:', error);
      return {
        success: false,
        message: 'Logout failed',
      };
    }
  }

  async deleteAccount(userId: number, role: string) {
    try {
      // Use direct Prisma lookups to avoid throwing NotFound from services
      const [user, provider] = await Promise.all([
        this.prisma.user.findUnique({ where: { id: userId } }),
        this.prisma.provider.findUnique({ where: { id: userId } }),
      ]);

      if (role === 'PROVIDER') {
        if (!provider) {
          throw new NotFoundException('Account not found');
        }
        // Check for unpaid commissions and pending orders before allowing deletion
        const unpaidInvoices = await this.prisma.invoice.findMany({
          where: {
            isDeleted: false,
            paymentStatus: { in: ['pending', 'unpaid'] }, // Check both statuses for consistency
            order: {
              providerId: userId,
            },
          },
          include: {
            order: {
              select: {
                id: true,
                commissionAmount: true,
                totalAmount: true,
                orderDate: true,
                bookingId: true,
                status: true,
              },
            },
          },
        });

        // Also check for any pending orders (regardless of invoice status)
        const pendingOrders = await this.prisma.order.findMany({
          where: {
            providerId: userId,
            status: { in: ['pending', 'accepted', 'in_progress'] },
          },
          select: {
            id: true,
            status: true,
            bookingId: true,
            orderDate: true,
          },
        });

        // Check for pending orders first
        if (pendingOrders.length > 0) {
          throw new BadRequestException(
            `Cannot delete account. Provider has ${pendingOrders.length} pending order(s) (${pendingOrders.map(o => o.status).join(', ')}). Please complete or cancel all pending orders before deleting the account.`,
          );
        }

        // Then check for unpaid invoices
        if (unpaidInvoices.length > 0) {
          const totalUnpaidCommission = unpaidInvoices.reduce(
            (sum, invoice) => sum + invoice.order.commissionAmount,
            0,
          );
          const totalUnpaidAmount = unpaidInvoices.reduce(
            (sum, invoice) => sum + invoice.totalAmount,
            0,
          );

          throw new BadRequestException(
            `Cannot delete account. Provider has ${unpaidInvoices.length} unpaid invoice(s) with total commission of ${totalUnpaidCommission} SAR and total amount of ${totalUnpaidAmount} SAR. Please settle all outstanding payments before deleting the account.`,
          );
        }
        // Determine whether another user shares the same phone; if yes, do not delete phone-based artifacts
        const userWithSamePhone = provider.phone
          ? await this.prisma.user.findFirst({
              where: { phone: provider.phone },
            })
          : null;

        // Clean delete of provider and all related data with no password required
        await this.prisma.$transaction(async (tx) => {
          // Get provider phone and email for cleanup
          const providerPhone = provider.phone;
          const providerEmail = provider.email;

          // Delete provider ratings (where provider is being rated)
          await tx.providerRating.deleteMany({
            where: { providerId: userId },
          });

          // Delete offers
          await tx.offer.deleteMany({
            where: { providerId: userId },
          });

          // Delete provider services
          await tx.providerService.deleteMany({
            where: { providerId: userId },
          });

          // Delete provider categories
          await tx.providerCategory.deleteMany({
            where: { providerId: userId },
          });

          // Delete location tracking
          await tx.locationTracking.deleteMany({
            where: { providerId: userId },
          });

          // Delete active connections
          await tx.activeConnection.deleteMany({
            where: {
              OR: [
                { userId: userId, userType: 'PROVIDER' },
                {
                  orderId: {
                    in: await tx.order
                      .findMany({
                        where: { providerId: userId },
                        select: { id: true },
                      })
                      .then((orders) => orders.map((o) => o.id)),
                  },
                },
              ],
            },
          });

          // Delete invoices first (to avoid foreign key constraint violation)
          await tx.invoice.deleteMany({
            where: {
              order: {
                providerId: userId,
              },
            },
          });

          // Delete orders (after invoices are deleted)
          await tx.order.deleteMany({
            where: { providerId: userId },
          });

          // Delete provider verification
          await tx.providerVerification.deleteMany({
            where: { providerId: userId },
          });

          // Delete provider join requests
          await tx.providerJoinRequest.deleteMany({
            where: { providerId: userId },
          });

          // Delete ad banners created by this provider
          await tx.adBanner.deleteMany({
            where: { providerId: userId },
          });

          // Delete OTPs/SMS linked to provider phone only if no user shares same phone
          if (!userWithSamePhone) {
            await tx.otp.deleteMany({ where: { phoneNumber: providerPhone } });
            await tx.smsLog.deleteMany({
              where: { phoneNumber: providerPhone },
            });
          }

          // Update invoices that were marked as deleted by this provider
          await tx.invoice.updateMany({
            where: { deletedBy: userId },
            data: { deletedBy: null },
          });

          // Finally delete the provider
          await tx.provider.delete({
            where: { id: userId },
          });
        });
      } else if (role === 'USER') {
        if (!user) {
          throw new NotFoundException('Account not found');
        }
        // Check for pending orders before allowing deletion
        // Note: Users are NOT responsible for invoice payments - that's between provider and admin
        const pendingOrders = await this.prisma.order.findMany({
          where: {
            userId: userId,
            status: { in: ['pending', 'accepted', 'in_progress'] },
          },
          select: {
            id: true,
            status: true,
            bookingId: true,
            orderDate: true,
          },
        });

        // Only check for pending orders - users are not responsible for invoice payments
        if (pendingOrders.length > 0) {
          throw new BadRequestException(
            `Cannot delete account. User has ${pendingOrders.length} pending order(s) (${pendingOrders.map(o => o.status).join(', ')}). Please complete or cancel all pending orders before deleting the account.`,
          );
        }
        // Determine whether a provider shares the same phone; if yes, do not delete phone-based artifacts
        const providerWithSamePhone = user.phone
          ? await this.prisma.provider.findFirst({
              where: { phone: user.phone },
            })
          : null;

        // Clean delete of user and all related data with no password required
        await this.prisma.$transaction(async (tx) => {
          // Get user phone and email for cleanup
          const userPhone = user.phone;
          const userEmail = user.email;

          // Delete user locations
          await tx.userLocation.deleteMany({
            where: { userId: userId },
          });

          // Delete provider ratings (where user is rating)
          await tx.providerRating.deleteMany({
            where: { userId: userId },
          });

          // Delete location tracking
          await tx.locationTracking.deleteMany({
            where: {
              orderId: {
                in: await tx.order
                  .findMany({ where: { userId: userId }, select: { id: true } })
                  .then((orders) => orders.map((o) => o.id)),
              },
            },
          });

          // Delete active connections
          await tx.activeConnection.deleteMany({
            where: {
              OR: [
                { userId: userId, userType: 'USER' },
                {
                  orderId: {
                    in: await tx.order
                      .findMany({
                        where: { userId: userId },
                        select: { id: true },
                      })
                      .then((orders) => orders.map((o) => o.id)),
                  },
                },
              ],
            },
          });

          // Delete invoices first (to avoid foreign key constraint violation)
          await tx.invoice.deleteMany({
            where: {
              order: {
                userId: userId,
              },
            },
          });

          // Delete orders (after invoices are deleted)
          await tx.order.deleteMany({
            where: { userId: userId },
          });

          // Delete OTPs/SMS linked to user phone only if no provider shares same phone
          if (!providerWithSamePhone) {
            await tx.otp.deleteMany({ where: { phoneNumber: userPhone } });
            await tx.smsLog.deleteMany({ where: { phoneNumber: userPhone } });
          }

          // Update invoices that were marked as deleted by this user
          await tx.invoice.updateMany({
            where: { deletedBy: userId },
            data: { deletedBy: null },
          });

          // Finally delete the user
          await tx.user.delete({
            where: { id: userId },
          });
        });
      } else {
        // For any other roles, block deletion to avoid accidental cross-role deletions
        throw new ForbiddenException('Unsupported role for account deletion');
      }
      return {
        success: true,
        message: 'Account deleted successfully',
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Error deleting account');
    }
  }
}

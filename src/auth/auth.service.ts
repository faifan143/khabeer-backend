import { Injectable, UnauthorizedException, BadRequestException, ConflictException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { ProvidersService } from '../providers/providers.service';
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from './dto/register.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly providersService: ProvidersService,
    private readonly jwtService: JwtService,
  ) { }

  async validateUser(email: string, pass: string): Promise<any> {
    try {
      // First check if it's a regular user
      const user = await this.usersService.findByEmail(email);
      if (user && await bcrypt.compare(pass, user.password)) {
        // Only check isActive for regular users (not admins)
        if (user.role === 'USER' && !user.isActive) {
          throw new UnauthorizedException('Your account is not active. Please contact admin for activation.');
        }

        const { password, ...result } = user;
        return { ...result, role: user.role };
      }

      // If not a user, check if it's a provider
      const provider = await this.providersService.findByEmail(email);
      if (provider && provider.password && provider.password.trim() !== '' && await bcrypt.compare(pass, provider.password)) {
        // Only check if provider is verified (admin approval)
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

      // Prepare user data
      const userData = {
        ...data,
        password: hashedPassword,
        image: data.image || '',
        address: data.address || '',
        phone: data.phone || '',
        state: data.state || '',
        isActive: data.isActive ?? true
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
          message: 'Provider registered successfully. Please wait for admin approval.'
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
            message: user.isActive ? 'Account is active' : 'Account is not active. Please contact admin.'
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
      const provider = await this.providersService.findById(providerId);
      if (!provider) {
        throw new NotFoundException('Provider not found');
      }

      if (!provider.isVerified) {
        throw new BadRequestException('Your account must be verified by admin before you can activate it.');
      }

      const updatedProvider = await this.providersService.update(providerId, { isActive: true });
      return {
        ...updatedProvider,
        message: 'Account activated successfully. You can now accept orders.'
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Error activating account');
    }
  }

  async deactivateProviderAccount(providerId: number) {
    try {
      const provider = await this.providersService.findById(providerId);
      if (!provider) {
        throw new NotFoundException('Provider not found');
      }

      const updatedProvider = await this.providersService.update(providerId, { isActive: false });
      return {
        ...updatedProvider,
        message: 'Account deactivated successfully. You will not receive new orders.'
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error deactivating account');
    }
  }
}

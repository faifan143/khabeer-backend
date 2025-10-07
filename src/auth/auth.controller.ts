import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Post,
  Request,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express/multer';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { FilesService } from 'src/files/files.service';
import { AuthService } from './auth.service';
import { ComprehensiveAuthGuard } from './comprehensive-auth.guard';
import { LoginDto } from './dto/login.dto';
import {
  PasswordResetResponseDto,
  ResetPasswordDto,
  SendPasswordResetOtpDto,
} from './dto/password-reset.dto';
import { RegisterType } from './dto/register.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly filesService: FilesService,
  ) {}

  @Get('terms')
  @ApiOperation({ summary: 'Get terms and conditions' })
  @ApiResponse({ status: 200, description: 'Terms and conditions retrieved' })
  async getTermsAndConditions() {
    return this.authService.getTermsAndConditions();
  }

  @Get('check-me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Check current user status and permissions',
  })
  @ApiResponse({
    status: 200,
    description: 'User status retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async checkMe(@Request() req) {
    try {
      const user = req.user;

      // Check if user is the main super admin
      if (user.email === 'admin@khabeer.com') {
        return {
          isSuperAdmin: true,
          permissions: [],
        };
      }

      // For subadmins, return their actual permissions
      return {
        isSuperAdmin: false,
        permissions: user.permissions || [],
      };
    } catch (error) {
      console.error('Check me error:', error);
      throw new UnauthorizedException('Unable to check user status');
    }
  }

  @Post('login')
  @ApiOperation({
    summary:
      'Login with email/password for admins or phone/password for users and providers. Type field required for regular users.',
  })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({
    status: 400,
    description: 'Invalid credentials or missing required fields',
  })
  async login(@Body() body: LoginDto) {
    try {
      // Admin login - email and password only
      if (body.email && !body.phone && !body.type) {
        const user = await this.authService.validateUser({
          email: body.email,
          phone: '', // Empty phone for admin login
          password: body.password,
          type: 'USER' as any, // Dummy type for admin login
        });

        if (!user) {
          throw new BadRequestException('Invalid admin credentials');
        }

        // Use FCM-enabled login if FCM token is provided
        if (body.fcm) {
          return this.authService.loginWithFCM(user, body.fcm);
        }

        return this.authService.login(user);
      }

      // Regular user/provider login - phone and type required
      if (!body.phone) {
        throw new BadRequestException(
          'Phone number is required for user/provider login',
        );
      }

      if (!body.type) {
        throw new BadRequestException(
          'Account type (USER or PROVIDER) is required for regular login',
        );
      }

      // Normalize phone number - add + prefix if missing
      const normalizedPhone = body.phone.startsWith('+')
        ? body.phone
        : `+${body.phone}`;

      // Create normalized body for validation
      const normalizedBody = {
        ...body,
        phone: normalizedPhone,
        type: body.type,
      };

      const user = await this.authService.validateUser(normalizedBody);
      if (!user) {
        throw new BadRequestException('Invalid credentials');
      }
      if (user.isActive == false) {
        throw new ForbiddenException(
          'Your account is not active. Please contact support to activate your account.',
        );
      }

      // Use FCM-enabled login if FCM token is provided
      if (body.fcm) {
        return this.authService.loginWithFCM(user, body.fcm);
      }

      return this.authService.login(user);
    } catch (error) {
      console.error('Login error:', error);
      // Re-throw UnauthorizedException (for unverified providers) as-is
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      // Re-throw BadRequestException (for invalid credentials) as-is
      if (error instanceof BadRequestException) {
        throw error;
      }
      // Re-throw ForbiddenException as-is
      if (error instanceof ForbiddenException) {
        throw error;
      }
      // For any other errors, throw invalid credentials
      throw new BadRequestException('Invalid credentials');
    }
  }

  @Post('phone/password-reset/send-otp')
  @ApiOperation({ summary: 'Send OTP for password reset' })
  @ApiResponse({
    status: 200,
    description: 'OTP sent successfully',
    type: PasswordResetResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid phone number or account not found',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many OTP requests, please wait',
  })
  async sendPasswordResetOtp(@Body() body: SendPasswordResetOtpDto) {
    return this.authService.sendPasswordResetOtp(body.phoneNumber);
  }

  @Post('phone/password-reset')
  @ApiOperation({ summary: 'Reset password with phone verification' })
  @ApiResponse({
    status: 200,
    description: 'Password reset successful',
    type: PasswordResetResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid OTP or data' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  async resetPasswordWithPhone(@Body() body: ResetPasswordDto) {
    return this.authService.resetPasswordWithPhone(
      body.phoneNumber,
      body.otp,
      body.newPassword,
    );
  }

  @Post('register/initiate')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/images/users',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `user-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  @ApiOperation({
    summary:
      'Step 1: Initiate registration and send OTP - User/Provider provides all data including password and services with prices. Business rule: Providers can register as users, but users cannot register as providers.',
  })
  @ApiResponse({ status: 200, description: 'Registration initiated, OTP sent' })
  @ApiResponse({
    status: 400,
    description: 'Invalid data or user already exists',
  })
  @ApiResponse({
    status: 409,
    description:
      'Phone number already registered or business rule violation (users cannot register as providers)',
  })
  async initiateRegistration(
    @Body() body: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    console.log('body', body);

    // Validate required fields
    if (!body.password || !body.name || !body.phoneNumber) {
      throw new BadRequestException(
        'Password, name, and phone number are required',
      );
    }

    // Validate categoryIds if provided (for provider registration)
    if (body.categoryIds && Array.isArray(body.categoryIds)) {
      for (const categoryId of body.categoryIds) {
        if (!categoryId || isNaN(Number(categoryId))) {
          throw new BadRequestException(
            'Each categoryId must be a valid number',
          );
        }
      }
    }

    // Normalize data
    const registerData: any = {
      registerType: body.registerType || RegisterType.USER, // Allow both user and provider registration
      name: Array.isArray(body.name) ? body.name[0] : body.name,
      email: Array.isArray(body.email) ? body.email[0] : body.email,
      password: Array.isArray(body.password) ? body.password[0] : body.password,
      phoneNumber: Array.isArray(body.phoneNumber)
        ? body.phoneNumber[0]
        : body.phoneNumber,
      role: Array.isArray(body.role) ? body.role[0] : body.role || 'USER',
      address: Array.isArray(body.address)
        ? body.address[0]
        : body.address || '',
      phone: Array.isArray(body.phone) ? body.phone[0] : body.phone || '',
      state: Array.isArray(body.state) ? body.state[0] : body.state || '',
      isActive: true,
      officialDocuments: Array.isArray(body.officialDocuments)
        ? body.officialDocuments[0]
        : body.officialDocuments,
      description: Array.isArray(body.description)
        ? body.description[0]
        : body.description || '',
      categoryIds: body.categoryIds || [],
    };

    // Handle file upload
    if (file) {
      // Since we're using disk storage, we can construct the URL directly
      const imageUrl = `/uploads/images/users/${file.filename}`;
      registerData.image = imageUrl;
    } else {
      registerData.image = '';
    }
    return this.authService.initiateRegistration(registerData);
  }

  @Post('register/complete')
  @ApiOperation({
    summary:
      'Step 2: Complete registration with OTP verification - Only phone and OTP required',
  })
  @ApiResponse({
    status: 200,
    description: 'Registration completed successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid OTP or registration data expired',
  })
  async completeRegistration(
    @Body() body: { phoneNumber: string; otp: string },
  ) {
    // Validate required fields - only phone and OTP are needed
    if (!body.phoneNumber || !body.otp) {
      throw new BadRequestException('Phone number and OTP are required');
    }

    // Normalize data
    const phoneNumber = Array.isArray(body.phoneNumber)
      ? body.phoneNumber[0]
      : body.phoneNumber;
    const otp = Array.isArray(body.otp) ? body.otp[0] : body.otp;

    return this.authService.completeRegistration(phoneNumber, otp);
  }

  @Post('me')
  @UseGuards(JwtAuthGuard, ComprehensiveAuthGuard)
  @ApiOperation({ summary: 'Get current user information' })
  @ApiResponse({ status: 200, description: 'User information retrieved' })
  async me(@Request() req) {
    return req.user;
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard, ComprehensiveAuthGuard)
  @ApiOperation({ summary: 'Logout user and clear FCM token' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logout(@Request() req) {
    return this.authService.logout(req.user.userId, req.user.role);
  }

  @Post('upgrade-to-provider')
  @UseGuards(ComprehensiveAuthGuard)
  @ApiOperation({ summary: 'Upgrade user account to provider' })
  @ApiResponse({ status: 200, description: 'Account upgraded successfully' })
  async upgradeToProvider(@Request() req, @Body() providerData: any) {
    return this.authService.upgradeToProvider(req.user.userId, providerData);
  }

  @Post('check-status')
  @ApiOperation({ summary: 'Check account status by email' })
  @ApiResponse({ status: 200, description: 'Account status retrieved' })
  async checkAccountStatus(@Body() body: { email: string }) {
    return this.authService.checkAccountStatus(body.email);
  }

  @Post('activate-account')
  @UseGuards(ComprehensiveAuthGuard)
  @ApiOperation({ summary: 'Activate provider account' })
  @ApiResponse({ status: 200, description: 'Account activated successfully' })
  async activateAccount(@Request() req) {
    return this.authService.activateProviderAccount(req.user.userId);
  }

  @Post('deactivate-account')
  @UseGuards(ComprehensiveAuthGuard)
  @ApiOperation({ summary: 'Deactivate provider account' })
  @ApiResponse({ status: 200, description: 'Account deactivated successfully' })
  async deactivateAccount(@Request() req) {
    return this.authService.deactivateProviderAccount(req.user.userId);
  }

  @Post('register/check-status')
  @ApiOperation({
    summary: 'Check if registration data exists for a phone number',
  })
  @ApiResponse({ status: 200, description: 'Registration status checked' })
  @ApiResponse({ status: 400, description: 'Phone number required' })
  async checkRegistrationStatus(@Body() body: { phoneNumber: string }) {
    if (!body.phoneNumber) {
      throw new BadRequestException('Phone number is required');
    }
    return this.authService.checkRegistrationStatus(body.phoneNumber);
  }

  @Delete('delete-account')
  @UseGuards(ComprehensiveAuthGuard)
  @ApiOperation({ summary: 'Delete user account' })
  @ApiResponse({ status: 200, description: 'Account deleted successfully' })
  async deleteAccount(@Request() req) {
    return this.authService.deleteAccount(req.user.userId);
  }
}

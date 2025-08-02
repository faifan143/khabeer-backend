import { Controller, Post, Body, Request, UseGuards, UploadedFile, UseInterceptors, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { PhoneLoginDto, PhoneRegistrationDto, PhoneLoginResponseDto, DirectPhoneLoginDto } from './dto/phone-login.dto';
import { FileInterceptor } from '@nestjs/platform-express/multer';
import { FilesService } from 'src/files/files.service';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly filesService: FilesService
  ) { }

  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 400, description: 'Invalid credentials' })
  async login(@Body() body: LoginDto) {
    try {
      const user = await this.authService.validateUser(body.email, body.password);
      if (!user) {
        throw new BadRequestException('Invalid credentials');
      }
      return this.authService.login(user);
    } catch (error) {
      // Re-throw UnauthorizedException (for unverified providers) as-is
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      // Re-throw BadRequestException (for invalid credentials) as-is
      if (error instanceof BadRequestException) {
        throw error;
      }
      // For any other errors, throw invalid credentials
      throw new BadRequestException('Invalid credentials');
    }
  }

  @Post('phone/login')
  @ApiOperation({ summary: 'Phone login without OTP (optional password)' })
  @ApiResponse({ status: 200, description: 'Login successful', type: PhoneLoginResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid credentials' })
  async phoneLogin(@Body() directPhoneLoginDto: DirectPhoneLoginDto) {
    return this.authService.phoneLogin(directPhoneLoginDto);
  }

  @Post('phone/register/send-otp')
  @ApiOperation({ summary: 'Send OTP for phone-based registration' })
  @ApiResponse({ status: 200, description: 'OTP sent successfully' })
  @ApiResponse({ status: 400, description: 'Invalid phone number' })
  async sendPhoneRegistrationOtp(@Body() phoneLoginDto: PhoneLoginDto) {
    return this.authService.sendPhoneLoginOtp({ ...phoneLoginDto, purpose: 'registration' });
  }

  @Post('phone/register')
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: 'Register with phone verification (OTP optional)' })
  @ApiResponse({ status: 200, description: 'Registration successful' })
  @ApiResponse({ status: 400, description: 'Invalid data or OTP' })
  async registerWithPhone(@Body() body: any, @UploadedFile() file: Express.Multer.File) {
    console.log('Phone register body:', body);

    // Validate required fields (OTP is now optional)
    if (!body.phoneNumber || !body.name || !body.password) {
      throw new BadRequestException('Phone number, name, and password are required');
    }

    // Normalize multipart data
    const registerData: RegisterDto & { phoneNumber: string; otp?: string } = {
      name: Array.isArray(body.name) ? body.name[0] : body.name,
      email: Array.isArray(body.email) ? body.email[0] : body.email || '',
      password: Array.isArray(body.password) ? body.password[0] : body.password,
      phoneNumber: Array.isArray(body.phoneNumber) ? body.phoneNumber[0] : body.phoneNumber,
      otp: Array.isArray(body.otp) ? body.otp[0] : body.otp, // Optional now
      role: Array.isArray(body.role) ? body.role[0] : body.role || 'USER',
      address: Array.isArray(body.address) ? body.address[0] : body.address || '',
      phone: Array.isArray(body.phone) ? body.phone[0] : body.phone || '',
      state: Array.isArray(body.state) ? body.state[0] : body.state || '',
      isActive: body.isActive === 'true' || body.isActive === true,
      officialDocuments: Array.isArray(body.officialDocuments) ? body.officialDocuments[0] : body.officialDocuments,
      description: Array.isArray(body.description) ? body.description[0] : body.description || '',
      serviceIds: this.parseServiceIds(body.serviceIds)
    };

    // Handle file upload
    if (file) {
      const uploadResult = await this.filesService.handleUploadedFile(file);
      registerData.image = uploadResult.url;
    }

    return this.authService.registerWithPhone(registerData);
  }

  @Post('phone/password-reset/send-otp')
  @ApiOperation({ summary: 'Send OTP for password reset' })
  @ApiResponse({ status: 200, description: 'OTP sent successfully' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  async sendPasswordResetOtp(@Body() body: { phoneNumber: string }) {
    return this.authService.sendPhoneLoginOtp({
      phoneNumber: body.phoneNumber,
      purpose: 'password_reset'
    });
  }

  @Post('phone/password-reset')
  @ApiOperation({ summary: 'Reset password with phone verification' })
  @ApiResponse({ status: 200, description: 'Password reset successful' })
  @ApiResponse({ status: 400, description: 'Invalid OTP or data' })
  async resetPasswordWithPhone(@Body() body: { phoneNumber: string; otp: string; newPassword: string }) {
    return this.authService.resetPasswordWithPhone(body.phoneNumber, body.otp, body.newPassword);
  }

  @Post('register')
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: 'Register with email and password' })
  @ApiResponse({ status: 200, description: 'Registration successful' })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  async register(@Body() body: any, @UploadedFile() file: Express.Multer.File) {
    console.log('Register body:', body);

    // Validate required fields manually
    if (!body.email || !body.password || !body.name) {
      throw new BadRequestException('Email, password, and name are required');
    }

    // Normalize multipart data (some parsers send fields as arrays)
    const registerData: RegisterDto = {
      name: Array.isArray(body.name) ? body.name[0] : body.name,
      email: Array.isArray(body.email) ? body.email[0] : body.email,
      password: Array.isArray(body.password) ? body.password[0] : body.password,
      role: Array.isArray(body.role) ? body.role[0] : body.role || 'USER',
      address: Array.isArray(body.address) ? body.address[0] : body.address || '',
      phone: Array.isArray(body.phone) ? body.phone[0] : body.phone || '',
      state: Array.isArray(body.state) ? body.state[0] : body.state || '',
      isActive: body.isActive === 'true' || body.isActive === true,
      officialDocuments: Array.isArray(body.officialDocuments) ? body.officialDocuments[0] : body.officialDocuments,
      description: Array.isArray(body.description) ? body.description[0] : body.description || '',
      serviceIds: this.parseServiceIds(body.serviceIds)
    };

    // Handle file upload
    if (file) {
      const fileResult = await this.filesService.handleUploadedFile(file);
      registerData.image = fileResult.url;
    } else {
      registerData.image = '';
    }

    // Determine role based on request context or description field
    if (body.description || registerData.role === 'PROVIDER') {
      registerData.role = 'PROVIDER';
    }

    return this.authService.register(registerData);
  }

  @Post('register/initiate')
  @ApiOperation({ summary: 'Step 1: Initiate registration and send OTP' })
  @ApiResponse({ status: 200, description: 'Registration initiated, OTP sent' })
  @ApiResponse({ status: 400, description: 'Invalid data or user already exists' })
  async initiateRegistration(@Body() body: any) {
    console.log('Initiate registration body:', body);

    // Validate required fields
    if (!body.email || !body.password || !body.name || !body.phoneNumber) {
      throw new BadRequestException('Email, password, name, and phone number are required');
    }

    // Normalize data
    const registerData = {
      name: Array.isArray(body.name) ? body.name[0] : body.name,
      email: Array.isArray(body.email) ? body.email[0] : body.email,
      password: Array.isArray(body.password) ? body.password[0] : body.password,
      phoneNumber: Array.isArray(body.phoneNumber) ? body.phoneNumber[0] : body.phoneNumber,
      role: Array.isArray(body.role) ? body.role[0] : body.role || 'USER',
      address: Array.isArray(body.address) ? body.address[0] : body.address || '',
      phone: Array.isArray(body.phone) ? body.phone[0] : body.phone || '',
      state: Array.isArray(body.state) ? body.state[0] : body.state || '',
      isActive: body.isActive === 'true' || body.isActive === true,
      officialDocuments: Array.isArray(body.officialDocuments) ? body.officialDocuments[0] : body.officialDocuments,
      description: Array.isArray(body.description) ? body.description[0] : body.description || '',
      serviceIds: this.parseServiceIds(body.serviceIds)
    };

    return this.authService.initiateRegistration(registerData);
  }

  @Post('register/complete')
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: 'Step 2: Complete registration with OTP verification' })
  @ApiResponse({ status: 200, description: 'Registration completed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid OTP or data' })
  async completeRegistration(@Body() body: any, @UploadedFile() file: Express.Multer.File) {
    console.log('Complete registration body:', body);

    // Validate required fields
    if (!body.email || !body.password || !body.name || !body.phoneNumber || !body.otp) {
      throw new BadRequestException('Email, password, name, phone number, and OTP are required');
    }

    // Normalize multipart data
    const registerData: any = {
      name: Array.isArray(body.name) ? body.name[0] : body.name,
      email: Array.isArray(body.email) ? body.email[0] : body.email,
      password: Array.isArray(body.password) ? body.password[0] : body.password,
      phoneNumber: Array.isArray(body.phoneNumber) ? body.phoneNumber[0] : body.phoneNumber,
      otp: Array.isArray(body.otp) ? body.otp[0] : body.otp,
      role: Array.isArray(body.role) ? body.role[0] : body.role || 'USER',
      address: Array.isArray(body.address) ? body.address[0] : body.address || '',
      phone: Array.isArray(body.phone) ? body.phone[0] : body.phone || '',
      state: Array.isArray(body.state) ? body.state[0] : body.state || '',
      isActive: body.isActive === 'true' || body.isActive === true,
      officialDocuments: Array.isArray(body.officialDocuments) ? body.officialDocuments[0] : body.officialDocuments,
      description: Array.isArray(body.description) ? body.description[0] : body.description || '',
      serviceIds: this.parseServiceIds(body.serviceIds)
    };

    // Handle file upload
    if (file) {
      const uploadResult = await this.filesService.handleUploadedFile(file);
      registerData.image = uploadResult.url;
    }

    return this.authService.completeRegistration(registerData);
  }

  @Post('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user information' })
  @ApiResponse({ status: 200, description: 'User information retrieved' })
  async me(@Request() req) {
    return req.user;
  }

  @Post('upgrade-to-provider')
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Activate provider account' })
  @ApiResponse({ status: 200, description: 'Account activated successfully' })
  async activateAccount(@Request() req) {
    return this.authService.activateProviderAccount(req.user.userId);
  }

  @Post('deactivate-account')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Deactivate provider account' })
  @ApiResponse({ status: 200, description: 'Account deactivated successfully' })
  async deactivateAccount(@Request() req) {
    return this.authService.deactivateProviderAccount(req.user.userId);
  }

  private parseServiceIds(serviceIds: any): number[] {
    if (!serviceIds) return [];

    // If it's a string, try to parse it as JSON
    if (typeof serviceIds === 'string') {
      try {
        const parsed = JSON.parse(serviceIds);
        return Array.isArray(parsed) ? parsed.map(id => Number(id)) : [];
      } catch {
        // If it's not JSON, treat it as a single ID
        return [Number(serviceIds)];
      }
    }

    // If it's already an array
    if (Array.isArray(serviceIds)) {
      return serviceIds.map(id => Number(id));
    }

    return [];
  }
}

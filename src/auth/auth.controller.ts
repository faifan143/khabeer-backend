import { Controller, Post, Body, Request, UseGuards, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { FileInterceptor } from '@nestjs/platform-express/multer';
import { FilesService } from 'src/files/files.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly filesService: FilesService
  ) { }

  @Post('login')
  async login(@Body() body: LoginDto) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }
    return this.authService.login(user);
  }

  @Post('register')
  @UseInterceptors(FileInterceptor('image'))
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
      registerData.image = await this.filesService.handleUploadedFile(file);
    } else {
      registerData.image = '';
    }

    // Determine role based on request context or description field
    if (body.description || registerData.role === 'PROVIDER') {
      registerData.role = 'PROVIDER';
    }

    return this.authService.register(registerData);
  }

  @Post('me')
  @UseGuards(JwtAuthGuard)
  async me(@Request() req) {
    return req.user;
  }

  @Post('upgrade-to-provider')
  @UseGuards(JwtAuthGuard)
  async upgradeToProvider(@Request() req, @Body() providerData: any) {
    return this.authService.upgradeToProvider(req.user.id, providerData);
  }

  @Post('check-status')
  async checkAccountStatus(@Body() body: { email: string }) {
    return this.authService.checkAccountStatus(body.email);
  }

  @Post('activate-account')
  @UseGuards(JwtAuthGuard)
  async activateAccount(@Request() req) {
    return this.authService.activateProviderAccount(req.user.id);
  }

  @Post('deactivate-account')
  @UseGuards(JwtAuthGuard)
  async deactivateAccount(@Request() req) {
    return this.authService.deactivateProviderAccount(req.user.id);
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

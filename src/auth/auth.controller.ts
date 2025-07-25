import { Controller, Post, Body, Request, UseGuards, UploadedFile, UseInterceptors } from '@nestjs/common';
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
      throw new Error('Invalid credentials');
    }
    return this.authService.login(user);
  }

  @Post('register')
  @UseInterceptors(FileInterceptor('image'))
  async register(@Body() body: RegisterDto, @UploadedFile() file: Express.Multer.File) {
    console.log('Register body:', body);
    body.image = file ? await this.filesService.handleUploadedFile(file) : '';
    // Some multipart parsers may send fields as arrays, so normalize
    if (Array.isArray(body.password)) body.password = body.password[0];
    if (Array.isArray(body.name)) body.name = body.name[0];
    if (Array.isArray(body.email)) body.email = body.email[0];
    if (Array.isArray(body.address)) body.address = body.address[0];
    if (Array.isArray(body.phone)) body.phone = body.phone[0];
    if (Array.isArray(body.state)) body.state = body.state[0];
    if (!body.password) throw new Error('Password is required');
    body.name = body.name || '';
    body.email = body.email || '';
    body.address = body.address || '';
    body.phone = body.phone || '';
    body.state = body.state || '';
    return this.authService.register(body);
  }

  @Post('me')
  @UseGuards(JwtAuthGuard)
  async me(@Request() req) {
    return req.user;
  }
}

import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { SmsService } from './sms.service';
import { SendOtpDto, VerifyOtpDto, OtpResponseDto } from './dto/send-sms.dto';
import { ComprehensiveAuthGuard } from '../auth/comprehensive-auth.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('SMS OTP')
@Controller('sms')
export class SmsController {
  constructor(
    private readonly smsService: SmsService,
    private readonly configService: ConfigService // 🔥 CRITICAL FIX: Inject ConfigService
  ) { }

  @Get('test')
  @ApiOperation({ summary: 'Test SMS module' })
  async testSmsModule() {
    return { message: 'SMS module is working!', timestamp: new Date().toISOString() };
  }

  @Post('otp/send')
  @ApiOperation({ summary: 'Send OTP via SMS' })
  @ApiResponse({ status: 200, description: 'OTP sent successfully', type: OtpResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async sendOtp(@Body() sendOtpDto: SendOtpDto) {
    return this.smsService.sendOtp(sendOtpDto);
  }

  @Post('otp/verify')
  @ApiOperation({ summary: 'Verify OTP' })
  @ApiResponse({ status: 200, description: 'OTP verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired OTP' })
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.smsService.verifyOtp(verifyOtpDto);
  }

  @Get('status')
  @UseGuards(ComprehensiveAuthGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get SMS service status' })
  @ApiResponse({ status: 200, description: 'SMS service status' })
  async getSmsStatus() {
    // 🔥 CRITICAL FIX: Use ConfigService instead of process.env
    const isConfigured = !!(
      this.configService.get('TAMIMAH_SMS_API_URL') &&
      this.configService.get('SMS_USERNAME') &&
      this.configService.get('SMS_PASSWORD')
    );

    return {
      service: 'Tamimah SMS',
      configured: isConfigured,
      status: isConfigured ? 'ready' : 'not_configured',
      timestamp: new Date().toISOString()
    };
  }
} 
import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SmsService } from './sms.service';
import { SendOtpDto, VerifyOtpDto, OtpResponseDto } from './dto/send-sms.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('SMS OTP')
@Controller('sms')
export class SmsController {
  constructor(private readonly smsService: SmsService) {}

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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get SMS service status' })
  @ApiResponse({ status: 200, description: 'SMS service status' })
  async getSmsStatus() {
    // Check if SMS service is configured
    const isConfigured = !!(
      process.env.TAMIMAH_SMS_API_URL &&
      process.env.TAMIMAH_SMS_USERNAME &&
      process.env.TAMIMAH_SMS_PASSWORD
    );

    return {
      service: 'Tamimah SMS',
      configured: isConfigured,
      status: isConfigured ? 'ready' : 'not_configured',
      timestamp: new Date().toISOString()
    };
  }
} 
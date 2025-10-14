import {
  Injectable,
  Logger,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { SendOtpDto, VerifyOtpDto, OtpResponseDto } from './dto/send-sms.dto';
import axios from 'axios';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Generate a random OTP
   */
  private generateOtp(length: number = 6): string {
    const otp = Math.floor(Math.random() * Math.pow(10, length))
      .toString()
      .padStart(length, '0');
    console.log('otp => ', otp);
    return otp;
  }

  /**
   * Send SMS using Tamimah SMS service
   */
  private async sendSms(
    phoneNumber: string,
    message: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Tamimah SMS API configuration - using the working endpoint
      const apiUrl = this.configService.get<string>(
        'TAMIMAH_SMS_API_URL',
        'https://tamimahsms.com/user/smspush.aspx',
      );
      const username = this.configService.get<string>(
        'SMS_USERNAME',
        'Khabsms',
      );
      const password = this.configService.get<string>(
        'SMS_PASSWORD',
        'Khab!rsm$24!',
      );
      const sender = this.configService.get<string>(
        'TAMIMAH_SMS_SENDER_ID',
        'Khabir',
      );
      const source = this.configService.get<string>(
        'TAMIMAH_SMS_SOURCE',
        'OTP',
      );

      if (!apiUrl || !username || !password) {
        throw new InternalServerErrorException(
          'SMS service configuration is missing',
        );
      }

      // Format phone number for Oman (968xxxxxxxx)
      let formattedPhone = phoneNumber.replace(/\D/g, ''); // Remove non-digits
      if (formattedPhone.startsWith('0')) {
        formattedPhone = '968' + formattedPhone.substring(1);
      } else if (formattedPhone.startsWith('+968')) {
        formattedPhone = formattedPhone.substring(1);
      } else if (formattedPhone.startsWith('968')) {
        // Already in correct format
      } else {
        formattedPhone = '968' + formattedPhone;
      }

      // Build query parameters for GET request (matching Flutter implementation)
      const params = new URLSearchParams({
        username: username,
        password: password,
        phoneno: formattedPhone,
        message: message,
        sender: sender,
        source: source,
      });

      const fullUrl = `${apiUrl}?${params.toString()}`;

      this.logger.log(
        `Sending SMS to ${formattedPhone} (original: ${phoneNumber})`,
      );
      this.logger.log(`SMS URL: ${fullUrl}`);

      // Make GET request to Tamimah SMS service (matching Flutter implementation)
      const response = await axios.get(fullUrl, {
        timeout: 10000, // 10 seconds timeout
      });

      this.logger.log(`SMS API Response: ${JSON.stringify(response.data)}`);

      // Handle Tamimah SMS response - check if it's successful
      if (response.status === 200) {
        // Log successful SMS
        await this.logSmsActivity(phoneNumber, message, 'sent', response.data);

        return {
          success: true,
          message: 'SMS sent successfully',
        };
      } else {
        throw new BadRequestException(
          `SMS sending failed: ${response.statusText || 'Unknown error'}`,
        );
      }
    } catch (error) {
      this.logger.error(`Error sending SMS: ${error.message}`, error.stack);

      // Log failed SMS attempt
      await this.logSmsActivity(phoneNumber, message, 'failed', {
        error: error.message,
      });

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Failed to send SMS. Please try again later.',
      );
    }
  }

  /**
   * Send OTP via SMS
   */
  async sendOtp(sendOtpDto: SendOtpDto): Promise<OtpResponseDto> {
    try {
      const { phoneNumber, purpose = 'verification' } = sendOtpDto;

      // Check if OTP is enabled in environment
      const otpEnabled =
        this.configService.get<string>('ENABLE_OTP', 'true').toLowerCase() ===
        'true';

      if (!otpEnabled) {
        this.logger.log(
          `OTP disabled in environment. Skipping OTP for ${phoneNumber}`,
        );
        return {
          success: true,
          message: 'OTP bypassed (disabled in environment)',
          expiresIn: 600, // 10 minutes
        };
      }

      // Generate OTP
      const otp = this.generateOtp(6);
      const expiresIn = 10 * 60; // 10 minutes

      // Create OTP record in database (store plain text OTP)
      const otpRecord = await this.prisma.otp.create({
        data: {
          phoneNumber,
          otp: otp, // Store plain text OTP (no hashing)
          purpose,
          expiresAt: new Date(Date.now() + expiresIn * 1000),
          attempts: 0,
        },
      });

      // Prepare SMS message based on purpose
      let message: string;
      switch (purpose) {
        case 'phone_change':
          message = `Your Khabir phone change verification code is: ${otp}. Valid for 10 minutes. Do not share this code with anyone.`;
          break;
        case 'registration':
          message = `Your Khabir registration verification code is: ${otp}. Valid for 10 minutes. Do not share this code with anyone.`;
          break;
        case 'password_reset':
          message = `Your Khabir password reset verification code is: ${otp}. Valid for 10 minutes. Do not share this code with anyone.`;
          break;
        default:
          message = `Your Khabir verification code is: ${otp}. Valid for 10 minutes. Do not share this code with anyone.`;
      }

      // Send SMS
      await this.sendSms(phoneNumber, message);

      this.logger.log(`OTP sent to ${phoneNumber} for purpose: ${purpose}`);

      return {
        success: true,
        message: 'OTP sent successfully',
        expiresIn,
      };
    } catch (error) {
      this.logger.error(`Error sending OTP: ${error.message}`, error.stack);

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Failed to send OTP. Please try again later.',
      );
    }
  }

  /**
   * Verify OTP
   */
  async verifyOtp(
    verifyOtpDto: VerifyOtpDto,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const { phoneNumber, otp, purpose = 'verification' } = verifyOtpDto;

      // Check if OTP is enabled in environment
      const otpEnabled =
        this.configService.get<string>('ENABLE_OTP', 'true').toLowerCase() ===
        'true';

      if (!otpEnabled) {
        this.logger.log(
          `OTP disabled in environment. Auto-verifying OTP for ${phoneNumber}`,
        );
        return {
          success: true,
          message: 'OTP verified (bypassed in environment)',
        };
      }

      // Find OTP record
      const otpRecord = await this.prisma.otp.findFirst({
        where: {
          phoneNumber,
          purpose,
          expiresAt: {
            gt: new Date(),
          },
          isUsed: false, // Only find unused OTPs
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (!otpRecord) {
        return {
          success: false,
          message: 'OTP not found or expired',
        };
      }

      // Check if OTP is blocked due to too many attempts
      if (otpRecord.attempts >= 5) {
        return {
          success: false,
          message: 'OTP is blocked due to too many failed attempts',
        };
      }

      // Verify OTP (plain text comparison)
      const isValid = otp === otpRecord.otp;

      if (!isValid) {
        // Increment attempts
        await this.prisma.otp.update({
          where: { id: otpRecord.id },
          data: { attempts: otpRecord.attempts + 1 },
        });

        return {
          success: false,
          message: 'Invalid OTP',
        };
      }

      // Mark OTP as used
      await this.prisma.otp.update({
        where: { id: otpRecord.id },
        data: {
          isUsed: true,
          usedAt: new Date(),
        },
      });

      this.logger.log(`OTP verified successfully for ${phoneNumber}`);

      return {
        success: true,
        message: 'OTP verified successfully',
      };
    } catch (error) {
      this.logger.error(`Error verifying OTP: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to verify OTP');
    }
  }

  /**
   * Log SMS activity
   */
  private async logSmsActivity(
    phoneNumber: string,
    message: string,
    status: string,
    response: any,
  ) {
    try {
      await this.prisma.smsLog.create({
        data: {
          phoneNumber,
          message,
          status,
          response: JSON.stringify(response),
          sentAt: new Date(),
        },
      });
    } catch (error) {
      this.logger.error(`Failed to log SMS activity: ${error.message}`);
    }
  }

  /**
   * Clean up expired OTPs
   */
  async cleanupExpiredOtps(): Promise<void> {
    try {
      await this.prisma.otp.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      });
    } catch (error) {
      this.logger.error(`Failed to cleanup expired OTPs: ${error.message}`);
    }
  }
}

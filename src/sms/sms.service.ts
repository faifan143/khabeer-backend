import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { SendOtpDto, VerifyOtpDto, OtpResponseDto } from './dto/send-sms.dto';
import axios from 'axios';
import * as crypto from 'crypto';

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
    return Math.floor(Math.random() * Math.pow(10, length))
      .toString()
      .padStart(length, '0');
  }

  /**
   * Send SMS using Tamimah SMS service
   */
  private async sendSms(phoneNumber: string, message: string): Promise<{ success: boolean; message: string }> {
    try {
      // Tamimah SMS API configuration
      const apiUrl = this.configService.get<string>('TAMIMAH_SMS_API_URL');
      const username = this.configService.get<string>('TAMIMAH_SMS_USERNAME');
      const password = this.configService.get<string>('TAMIMAH_SMS_PASSWORD');
      const sender = this.configService.get<string>('TAMIMAH_SMS_SENDER_ID', 'Khabeer');

      if (!apiUrl || !username || !password) {
        throw new InternalServerErrorException('SMS service configuration is missing');
      }

      // Prepare request payload for Tamimah SMS
      const payload = {
        username,
        password,
        sender,
        numbers: phoneNumber,
        message,
        unicode: 'U', // For Arabic support
        return: 'full' // Return full response
      };

      this.logger.log(`Sending SMS to ${phoneNumber}`);

      // Make API call to Tamimah SMS service
      const response = await axios.post(apiUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 seconds timeout
      });

      this.logger.log(`SMS API Response: ${JSON.stringify(response.data)}`);

      // Handle Tamimah SMS response
      if (response.data && response.data.status === 'success') {
        // Log successful SMS
        await this.logSmsActivity(phoneNumber, message, 'sent', response.data);
        
        return {
          success: true,
          message: 'SMS sent successfully'
        };
      } else {
        throw new BadRequestException(`SMS sending failed: ${response.data?.message || 'Unknown error'}`);
      }

    } catch (error) {
      this.logger.error(`Error sending SMS: ${error.message}`, error.stack);
      
      // Log failed SMS attempt
      await this.logSmsActivity(phoneNumber, message, 'failed', { error: error.message });
      
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      throw new InternalServerErrorException('Failed to send SMS. Please try again later.');
    }
  }

  /**
   * Send OTP via SMS
   */
  async sendOtp(sendOtpDto: SendOtpDto): Promise<OtpResponseDto> {
    try {
      const { phoneNumber, purpose = 'verification' } = sendOtpDto;

      // Check if there's a recent OTP request (rate limiting)
      const recentOtp = await this.prisma.otp.findFirst({
        where: {
          phoneNumber,
          purpose,
          createdAt: {
            gte: new Date(Date.now() - 2 * 60 * 1000) // 2 minutes ago
          }
        }
      });

      if (recentOtp) {
        const timeDiff = Date.now() - recentOtp.createdAt.getTime();
        const retryAfter = Math.ceil((2 * 60 * 1000 - timeDiff) / 1000);
        
        return {
          success: false,
          message: 'Please wait before requesting another OTP',
          retryAfter
        };
      }

      // Generate OTP
      const otp = this.generateOtp(6);
      const expiresIn = 10 * 60; // 10 minutes

      // Create OTP record in database
      const otpRecord = await this.prisma.otp.create({
        data: {
          phoneNumber,
          otp: await this.hashOtp(otp),
          purpose,
          expiresAt: new Date(Date.now() + expiresIn * 1000),
          attempts: 0
        }
      });

      // Prepare SMS message
      const message = `Your Khabeer verification code is: ${otp}. Valid for 10 minutes. Do not share this code with anyone.`;

      // Send SMS
      await this.sendSms(phoneNumber, message);

      this.logger.log(`OTP sent to ${phoneNumber} for purpose: ${purpose}`);

      return {
        success: true,
        message: 'OTP sent successfully',
        expiresIn
      };

    } catch (error) {
      this.logger.error(`Error sending OTP: ${error.message}`, error.stack);
      
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      throw new InternalServerErrorException('Failed to send OTP. Please try again later.');
    }
  }

  /**
   * Verify OTP
   */
  async verifyOtp(verifyOtpDto: VerifyOtpDto): Promise<{ success: boolean; message: string }> {
    try {
      const { phoneNumber, otp, purpose = 'verification' } = verifyOtpDto;

      // Find OTP record
      const otpRecord = await this.prisma.otp.findFirst({
        where: {
          phoneNumber,
          purpose,
          expiresAt: {
            gt: new Date()
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      if (!otpRecord) {
        return {
          success: false,
          message: 'OTP not found or expired'
        };
      }

      // Check if OTP is blocked due to too many attempts
      if (otpRecord.attempts >= 5) {
        return {
          success: false,
          message: 'OTP is blocked due to too many failed attempts'
        };
      }

      // Verify OTP
      const isValid = await this.verifyOtpHash(otp, otpRecord.otp);

      if (!isValid) {
        // Increment attempts
        await this.prisma.otp.update({
          where: { id: otpRecord.id },
          data: { attempts: otpRecord.attempts + 1 }
        });

        return {
          success: false,
          message: 'Invalid OTP'
        };
      }

      // Mark OTP as used
      await this.prisma.otp.update({
        where: { id: otpRecord.id },
        data: { 
          isUsed: true,
          usedAt: new Date()
        }
      });

      this.logger.log(`OTP verified successfully for ${phoneNumber}`);

      return {
        success: true,
        message: 'OTP verified successfully'
      };

    } catch (error) {
      this.logger.error(`Error verifying OTP: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to verify OTP');
    }
  }

  /**
   * Hash OTP for secure storage
   */
  private async hashOtp(otp: string): Promise<string> {
    return crypto.createHash('sha256').update(otp).digest('hex');
  }

  /**
   * Verify OTP hash
   */
  private async verifyOtpHash(otp: string, hash: string): Promise<boolean> {
    const otpHash = await this.hashOtp(otp);
    return otpHash === hash;
  }

  /**
   * Log SMS activity
   */
  private async logSmsActivity(phoneNumber: string, message: string, status: string, response: any) {
    try {
      await this.prisma.smsLog.create({
        data: {
          phoneNumber,
          message,
          status,
          response: JSON.stringify(response),
          sentAt: new Date()
        }
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
            lt: new Date()
          }
        }
      });
    } catch (error) {
      this.logger.error(`Failed to cleanup expired OTPs: ${error.message}`);
    }
  }
} 
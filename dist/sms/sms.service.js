"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var SmsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
const axios_1 = require("axios");
const crypto = require("crypto");
let SmsService = SmsService_1 = class SmsService {
    configService;
    prisma;
    logger = new common_1.Logger(SmsService_1.name);
    constructor(configService, prisma) {
        this.configService = configService;
        this.prisma = prisma;
    }
    generateOtp(length = 6) {
        return Math.floor(Math.random() * Math.pow(10, length))
            .toString()
            .padStart(length, '0');
    }
    async sendSms(phoneNumber, message) {
        try {
            const apiUrl = this.configService.get('TAMIMAH_SMS_API_URL');
            const username = this.configService.get('TAMIMAH_SMS_USERNAME');
            const password = this.configService.get('TAMIMAH_SMS_PASSWORD');
            const sender = this.configService.get('TAMIMAH_SMS_SENDER_ID', 'Khabeer');
            if (!apiUrl || !username || !password) {
                throw new common_1.InternalServerErrorException('SMS service configuration is missing');
            }
            const payload = {
                username,
                password,
                sender,
                numbers: phoneNumber,
                message,
                unicode: 'U',
                return: 'full'
            };
            this.logger.log(`Sending SMS to ${phoneNumber}`);
            const response = await axios_1.default.post(apiUrl, payload, {
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 10000,
            });
            this.logger.log(`SMS API Response: ${JSON.stringify(response.data)}`);
            if (response.data && response.data.status === 'success') {
                await this.logSmsActivity(phoneNumber, message, 'sent', response.data);
                return {
                    success: true,
                    message: 'SMS sent successfully'
                };
            }
            else {
                throw new common_1.BadRequestException(`SMS sending failed: ${response.data?.message || 'Unknown error'}`);
            }
        }
        catch (error) {
            this.logger.error(`Error sending SMS: ${error.message}`, error.stack);
            await this.logSmsActivity(phoneNumber, message, 'failed', { error: error.message });
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to send SMS. Please try again later.');
        }
    }
    async sendOtp(sendOtpDto) {
        try {
            const { phoneNumber, purpose = 'verification' } = sendOtpDto;
            const otpEnabled = this.configService.get('ENABLE_OTP', 'true').toLowerCase() === 'true';
            if (!otpEnabled) {
                this.logger.log(`OTP disabled in environment. Skipping OTP for ${phoneNumber}`);
                return {
                    success: true,
                    message: 'OTP bypassed (disabled in environment)',
                    expiresIn: 600
                };
            }
            const recentOtp = await this.prisma.otp.findFirst({
                where: {
                    phoneNumber,
                    purpose,
                    createdAt: {
                        gte: new Date(Date.now() - 2 * 60 * 1000)
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
            const otp = this.generateOtp(6);
            const expiresIn = 10 * 60;
            const otpRecord = await this.prisma.otp.create({
                data: {
                    phoneNumber,
                    otp: await this.hashOtp(otp),
                    purpose,
                    expiresAt: new Date(Date.now() + expiresIn * 1000),
                    attempts: 0
                }
            });
            const message = `Your Khabeer verification code is: ${otp}. Valid for 10 minutes. Do not share this code with anyone.`;
            await this.sendSms(phoneNumber, message);
            this.logger.log(`OTP sent to ${phoneNumber} for purpose: ${purpose}`);
            return {
                success: true,
                message: 'OTP sent successfully',
                expiresIn
            };
        }
        catch (error) {
            this.logger.error(`Error sending OTP: ${error.message}`, error.stack);
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to send OTP. Please try again later.');
        }
    }
    async verifyOtp(verifyOtpDto) {
        try {
            const { phoneNumber, otp, purpose = 'verification' } = verifyOtpDto;
            const otpEnabled = this.configService.get('ENABLE_OTP', 'true').toLowerCase() === 'true';
            if (!otpEnabled) {
                this.logger.log(`OTP disabled in environment. Auto-verifying OTP for ${phoneNumber}`);
                return {
                    success: true,
                    message: 'OTP verified (bypassed in environment)'
                };
            }
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
            if (otpRecord.attempts >= 5) {
                return {
                    success: false,
                    message: 'OTP is blocked due to too many failed attempts'
                };
            }
            const isValid = await this.verifyOtpHash(otp, otpRecord.otp);
            if (!isValid) {
                await this.prisma.otp.update({
                    where: { id: otpRecord.id },
                    data: { attempts: otpRecord.attempts + 1 }
                });
                return {
                    success: false,
                    message: 'Invalid OTP'
                };
            }
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
        }
        catch (error) {
            this.logger.error(`Error verifying OTP: ${error.message}`, error.stack);
            throw new common_1.InternalServerErrorException('Failed to verify OTP');
        }
    }
    async hashOtp(otp) {
        return crypto.createHash('sha256').update(otp).digest('hex');
    }
    async verifyOtpHash(otp, hash) {
        const otpHash = await this.hashOtp(otp);
        return otpHash === hash;
    }
    async logSmsActivity(phoneNumber, message, status, response) {
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
        }
        catch (error) {
            this.logger.error(`Failed to log SMS activity: ${error.message}`);
        }
    }
    async cleanupExpiredOtps() {
        try {
            await this.prisma.otp.deleteMany({
                where: {
                    expiresAt: {
                        lt: new Date()
                    }
                }
            });
        }
        catch (error) {
            this.logger.error(`Failed to cleanup expired OTPs: ${error.message}`);
        }
    }
};
exports.SmsService = SmsService;
exports.SmsService = SmsService = SmsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        prisma_service_1.PrismaService])
], SmsService);
//# sourceMappingURL=sms.service.js.map
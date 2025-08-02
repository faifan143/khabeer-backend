import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { SendOtpDto, VerifyOtpDto, OtpResponseDto } from './dto/send-sms.dto';
export declare class SmsService {
    private readonly configService;
    private readonly prisma;
    private readonly logger;
    constructor(configService: ConfigService, prisma: PrismaService);
    private generateOtp;
    private sendSms;
    sendOtp(sendOtpDto: SendOtpDto): Promise<OtpResponseDto>;
    verifyOtp(verifyOtpDto: VerifyOtpDto): Promise<{
        success: boolean;
        message: string;
    }>;
    private hashOtp;
    private verifyOtpHash;
    private logSmsActivity;
    cleanupExpiredOtps(): Promise<void>;
}

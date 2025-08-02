import { SmsService } from './sms.service';
import { SendOtpDto, VerifyOtpDto, OtpResponseDto } from './dto/send-sms.dto';
export declare class SmsController {
    private readonly smsService;
    constructor(smsService: SmsService);
    sendOtp(sendOtpDto: SendOtpDto): Promise<OtpResponseDto>;
    verifyOtp(verifyOtpDto: VerifyOtpDto): Promise<{
        success: boolean;
        message: string;
    }>;
    getSmsStatus(): Promise<{
        service: string;
        configured: boolean;
        status: string;
        timestamp: string;
    }>;
}

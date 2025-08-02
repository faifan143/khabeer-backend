export declare class SendOtpDto {
    phoneNumber: string;
    purpose?: string;
}
export declare class VerifyOtpDto {
    phoneNumber: string;
    otp: string;
    purpose?: string;
}
export declare class OtpResponseDto {
    success: boolean;
    message: string;
    expiresIn?: number;
    retryAfter?: number;
}

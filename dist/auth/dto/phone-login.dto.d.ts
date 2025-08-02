export declare class PhoneLoginDto {
    phoneNumber: string;
    purpose?: string;
}
export declare class PhoneRegistrationDto {
    phoneNumber: string;
    otp?: string;
    purpose?: string;
}
export declare class DirectPhoneLoginDto {
    phoneNumber: string;
    password?: string;
}
export declare class PhoneLoginResponseDto {
    success: boolean;
    message: string;
    access_token?: string;
    user?: {
        id: number;
        phone: string;
        role: string;
    };
}

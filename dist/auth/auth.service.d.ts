import { JwtService } from '@nestjs/jwt';
import { ProvidersService } from '../providers/providers.service';
import { SmsService } from '../sms/sms.service';
import { UsersService } from '../users/users.service';
import { DirectPhoneLoginDto, PhoneLoginDto, PhoneLoginResponseDto } from './dto/phone-login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthService {
    private readonly usersService;
    private readonly providersService;
    private readonly smsService;
    private readonly jwtService;
    private registrationCache;
    constructor(usersService: UsersService, providersService: ProvidersService, smsService: SmsService, jwtService: JwtService);
    private storeRegistrationData;
    private getRegistrationData;
    private removeRegistrationData;
    private cleanupExpiredCache;
    validateUser(loginData: {
        email?: string;
        phone?: string;
        password: string;
    }): Promise<any>;
    login(user: {
        id: number;
        email?: string;
        phone?: string;
        role: string;
    }): Promise<{
        access_token: string;
        user: {
            id: number;
            email: string | undefined;
            phone: string | undefined;
            role: string;
        };
    }>;
    loginWithFCM(user: {
        id: number;
        email?: string;
        phone?: string;
        role: string;
    }, fcmToken?: string): Promise<{
        access_token: string;
        user: {
            id: number;
            email: string | undefined;
            phone: string | undefined;
            role: string;
        };
    }>;
    register(data: RegisterDto): Promise<any>;
    upgradeToProvider(userId: number, providerData: any): Promise<{
        role: string;
        message: string;
        description: string;
        id: number;
        name: string;
        image: string;
        state: string;
        phone: string;
        isActive: boolean;
        officialDocuments: string | null;
        isVerified: boolean;
        location: import("generated/prisma/runtime/library").JsonValue | null;
        createdAt: Date;
        email: string | null;
        updatedAt: Date;
        password: string | null;
        fcm: string | null;
    }>;
    checkAccountStatus(identifier: string, type?: 'email' | 'phone'): Promise<{
        exists: boolean;
        type: string;
        isActive: boolean;
        isVerified: boolean;
        message: string;
    } | {
        exists: boolean;
        message: string;
        type?: undefined;
        isActive?: undefined;
        isVerified?: undefined;
    }>;
    activateProviderAccount(providerId: number): Promise<{
        message: string;
        providerServices: {
            serviceId: number;
            id: number;
            isActive: boolean;
            providerId: number;
            price: number;
        }[];
        description: string;
        id: number;
        name: string;
        image: string;
        state: string;
        phone: string;
        isActive: boolean;
        officialDocuments: string | null;
        isVerified: boolean;
        location: import("generated/prisma/runtime/library").JsonValue | null;
        createdAt: Date;
        email: string | null;
        updatedAt: Date;
        password: string | null;
        fcm: string | null;
    }>;
    deactivateProviderAccount(providerId: number): Promise<{
        message: string;
        providerServices: {
            serviceId: number;
            id: number;
            isActive: boolean;
            providerId: number;
            price: number;
        }[];
        description: string;
        id: number;
        name: string;
        image: string;
        state: string;
        phone: string;
        isActive: boolean;
        officialDocuments: string | null;
        isVerified: boolean;
        location: import("generated/prisma/runtime/library").JsonValue | null;
        createdAt: Date;
        email: string | null;
        updatedAt: Date;
        password: string | null;
        fcm: string | null;
    }>;
    sendPhoneLoginOtp(phoneLoginDto: PhoneLoginDto): Promise<{
        success: boolean;
        message: string;
        expiresIn?: number;
    }>;
    sendPasswordResetOtp(phoneNumber: string): Promise<{
        success: boolean;
        message: string;
        expiresIn?: number;
    }>;
    phoneLogin(directPhoneLoginDto: DirectPhoneLoginDto): Promise<PhoneLoginResponseDto>;
    registerWithPhone(data: RegisterDto & {
        phoneNumber: string;
        otp?: string;
    }): Promise<any>;
    resetPasswordWithPhone(phoneNumber: string, otp: string, newPassword: string): Promise<{
        success: boolean;
        message: string;
    }>;
    initiateRegistration(data: RegisterDto & {
        phoneNumber: string;
    }): Promise<{
        success: boolean;
        message: string;
        expiresIn?: number;
        registrationData?: any;
    }>;
    completeRegistration(phoneNumber: string, otp: string): Promise<any>;
    completeRegistrationWithData(data: RegisterDto & {
        phoneNumber: string;
        otp: string;
    }): Promise<any>;
    checkRegistrationStatus(phoneNumber: string): Promise<{
        exists: boolean;
        expiresIn?: number;
        message: string;
    }>;
    clearRegistrationData(phoneNumber: string): Promise<{
        success: boolean;
        message: string;
    }>;
}

import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { ProvidersService } from '../providers/providers.service';
import { SmsService } from '../sms/sms.service';
import { RegisterDto } from './dto/register.dto';
import { PhoneLoginDto, PhoneLoginResponseDto, DirectPhoneLoginDto } from './dto/phone-login.dto';
export declare class AuthService {
    private readonly usersService;
    private readonly providersService;
    private readonly smsService;
    private readonly jwtService;
    constructor(usersService: UsersService, providersService: ProvidersService, smsService: SmsService, jwtService: JwtService);
    validateUser(email: string, pass: string): Promise<any>;
    login(user: {
        id: number;
        email: string;
        role: string;
    }): Promise<{
        access_token: string;
        user: {
            id: number;
            email: string;
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
        email: string | null;
        password: string | null;
        image: string;
        state: string;
        phone: string;
        isActive: boolean;
        isVerified: boolean;
        location: import("generated/prisma/runtime/library").JsonValue | null;
        officialDocuments: string | null;
        fcmToken: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    checkAccountStatus(email: string): Promise<{
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
        email: string | null;
        password: string | null;
        image: string;
        state: string;
        phone: string;
        isActive: boolean;
        isVerified: boolean;
        location: import("generated/prisma/runtime/library").JsonValue | null;
        officialDocuments: string | null;
        fcmToken: string | null;
        createdAt: Date;
        updatedAt: Date;
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
        email: string | null;
        password: string | null;
        image: string;
        state: string;
        phone: string;
        isActive: boolean;
        isVerified: boolean;
        location: import("generated/prisma/runtime/library").JsonValue | null;
        officialDocuments: string | null;
        fcmToken: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    sendPhoneLoginOtp(phoneLoginDto: PhoneLoginDto): Promise<{
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
    }>;
    completeRegistration(data: RegisterDto & {
        phoneNumber: string;
        otp: string;
    }): Promise<any>;
}

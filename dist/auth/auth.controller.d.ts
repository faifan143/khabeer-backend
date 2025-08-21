import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { PhoneLoginDto, PhoneLoginResponseDto, DirectPhoneLoginDto } from './dto/phone-login.dto';
import { FilesService } from 'src/files/files.service';
export declare class AuthController {
    private readonly authService;
    private readonly filesService;
    constructor(authService: AuthService, filesService: FilesService);
    login(body: LoginDto): Promise<{
        access_token: string;
        user: {
            id: number;
            email: string | undefined;
            phone: string | undefined;
            role: string;
        };
    }>;
    phoneLogin(directPhoneLoginDto: DirectPhoneLoginDto): Promise<PhoneLoginResponseDto>;
    sendPhoneRegistrationOtp(phoneLoginDto: PhoneLoginDto): Promise<{
        success: boolean;
        message: string;
        expiresIn?: number;
    }>;
    registerWithPhone(body: any, file: Express.Multer.File): Promise<any>;
    sendPasswordResetOtp(body: {
        phoneNumber: string;
    }): Promise<{
        success: boolean;
        message: string;
        expiresIn?: number;
    }>;
    resetPasswordWithPhone(body: {
        phoneNumber: string;
        otp: string;
        newPassword: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    register(body: any, file: Express.Multer.File): Promise<any>;
    initiateRegistration(body: any): Promise<{
        success: boolean;
        message: string;
        expiresIn?: number;
    }>;
    completeRegistration(body: any, file: Express.Multer.File): Promise<any>;
    me(req: any): Promise<any>;
    upgradeToProvider(req: any, providerData: any): Promise<{
        role: string;
        message: string;
        id: number;
        name: string;
        image: string;
        phone: string;
        state: string;
        isActive: boolean;
        officialDocuments: string | null;
        email: string | null;
        password: string | null;
        createdAt: Date;
        updatedAt: Date;
        fcm: string | null;
        description: string;
        isVerified: boolean;
        location: import("generated/prisma/runtime/library").JsonValue | null;
    }>;
    checkAccountStatus(body: {
        email: string;
    }): Promise<{
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
    activateAccount(req: any): Promise<{
        message: string;
        providerServices: {
            id: number;
            isActive: boolean;
            providerId: number;
            serviceId: number;
            price: number;
        }[];
        id: number;
        name: string;
        image: string;
        phone: string;
        state: string;
        isActive: boolean;
        officialDocuments: string | null;
        email: string | null;
        password: string | null;
        createdAt: Date;
        updatedAt: Date;
        fcm: string | null;
        description: string;
        isVerified: boolean;
        location: import("generated/prisma/runtime/library").JsonValue | null;
    }>;
    deactivateAccount(req: any): Promise<{
        message: string;
        providerServices: {
            id: number;
            isActive: boolean;
            providerId: number;
            serviceId: number;
            price: number;
        }[];
        id: number;
        name: string;
        image: string;
        phone: string;
        state: string;
        isActive: boolean;
        officialDocuments: string | null;
        email: string | null;
        password: string | null;
        createdAt: Date;
        updatedAt: Date;
        fcm: string | null;
        description: string;
        isVerified: boolean;
        location: import("generated/prisma/runtime/library").JsonValue | null;
    }>;
    private parseServiceIds;
}

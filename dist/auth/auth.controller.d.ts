import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SendPasswordResetOtpDto, ResetPasswordDto } from './dto/password-reset.dto';
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
    sendPasswordResetOtp(body: SendPasswordResetOtpDto): Promise<{
        success: boolean;
        message: string;
        expiresIn?: number;
    }>;
    resetPasswordWithPhone(body: ResetPasswordDto): Promise<{
        success: boolean;
        message: string;
    }>;
    initiateRegistration(body: any, file: Express.Multer.File): Promise<{
        success: boolean;
        message: string;
        expiresIn?: number;
        registrationData?: any;
    }>;
    completeRegistration(body: {
        phoneNumber: string;
        otp: string;
    }): Promise<any>;
    me(req: any): Promise<any>;
    upgradeToProvider(req: any, providerData: any): Promise<{
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
    deactivateAccount(req: any): Promise<{
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
    checkRegistrationStatus(body: {
        phoneNumber: string;
    }): Promise<{
        exists: boolean;
        expiresIn?: number;
        message: string;
    }>;
    private parseServiceIds;
}

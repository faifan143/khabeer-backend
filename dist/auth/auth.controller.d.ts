import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { FilesService } from 'src/files/files.service';
export declare class AuthController {
    private readonly authService;
    private readonly filesService;
    constructor(authService: AuthService, filesService: FilesService);
    login(body: LoginDto): Promise<{
        access_token: string;
        user: {
            id: number;
            email: string;
            role: string;
        };
    }>;
    register(body: any, file: Express.Multer.File): Promise<any>;
    me(req: any): Promise<any>;
    upgradeToProvider(req: any, providerData: any): Promise<{
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
        createdAt: Date;
        updatedAt: Date;
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
        email: string | null;
        password: string | null;
        image: string;
        state: string;
        phone: string;
        isActive: boolean;
        isVerified: boolean;
        location: import("generated/prisma/runtime/library").JsonValue | null;
        officialDocuments: string | null;
        createdAt: Date;
        updatedAt: Date;
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
        email: string | null;
        password: string | null;
        image: string;
        state: string;
        phone: string;
        isActive: boolean;
        isVerified: boolean;
        location: import("generated/prisma/runtime/library").JsonValue | null;
        officialDocuments: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    private parseServiceIds;
}

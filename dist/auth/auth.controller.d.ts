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
        name: string;
        email: string | null;
        password: string | null;
        image: string;
        phone: string;
        state: string;
        isActive: boolean;
        officialDocuments: string | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        location: import("generated/prisma/runtime/library").JsonValue | null;
        description: string;
        isVerified: boolean;
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
            isActive: boolean;
            id: number;
            providerId: number;
            serviceId: number;
            price: number;
        }[];
        name: string;
        email: string | null;
        password: string | null;
        image: string;
        phone: string;
        state: string;
        isActive: boolean;
        officialDocuments: string | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        location: import("generated/prisma/runtime/library").JsonValue | null;
        description: string;
        isVerified: boolean;
    }>;
    deactivateAccount(req: any): Promise<{
        message: string;
        providerServices: {
            isActive: boolean;
            id: number;
            providerId: number;
            serviceId: number;
            price: number;
        }[];
        name: string;
        email: string | null;
        password: string | null;
        image: string;
        phone: string;
        state: string;
        isActive: boolean;
        officialDocuments: string | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        location: import("generated/prisma/runtime/library").JsonValue | null;
        description: string;
        isVerified: boolean;
    }>;
    private parseServiceIds;
}

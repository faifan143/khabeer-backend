import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { ProvidersService } from '../providers/providers.service';
import { RegisterDto } from './dto/register.dto';
export declare class AuthService {
    private readonly usersService;
    private readonly providersService;
    private readonly jwtService;
    constructor(usersService: UsersService, providersService: ProvidersService, jwtService: JwtService);
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
        id: number;
        name: string;
        email: string | null;
        password: string | null;
        image: string;
        description: string;
        state: string;
        phone: string;
        isActive: boolean;
        isVerified: boolean;
        location: import("generated/prisma/runtime/library").JsonValue | null;
        officialDocuments: string | null;
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
            id: number;
            isActive: boolean;
            price: number;
            serviceId: number;
            providerId: number;
        }[];
        id: number;
        name: string;
        email: string | null;
        password: string | null;
        image: string;
        description: string;
        state: string;
        phone: string;
        isActive: boolean;
        isVerified: boolean;
        location: import("generated/prisma/runtime/library").JsonValue | null;
        officialDocuments: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    deactivateProviderAccount(providerId: number): Promise<{
        message: string;
        providerServices: {
            id: number;
            isActive: boolean;
            price: number;
            serviceId: number;
            providerId: number;
        }[];
        id: number;
        name: string;
        email: string | null;
        password: string | null;
        image: string;
        description: string;
        state: string;
        phone: string;
        isActive: boolean;
        isVerified: boolean;
        location: import("generated/prisma/runtime/library").JsonValue | null;
        officialDocuments: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}

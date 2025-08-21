import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findByEmail(email: string): Promise<{
        id: number;
        name: string;
        image: string;
        state: string;
        phone: string;
        isActive: boolean;
        officialDocuments: string | null;
        createdAt: Date;
        email: string | null;
        updatedAt: Date;
        password: string;
        fcm: string | null;
        address: string;
        role: string;
        latitude: import("generated/prisma/runtime/library").Decimal | null;
        longitude: import("generated/prisma/runtime/library").Decimal | null;
    } | null>;
    findByPhone(phone: string): Promise<{
        id: number;
        name: string;
        image: string;
        state: string;
        phone: string;
        isActive: boolean;
        officialDocuments: string | null;
        createdAt: Date;
        email: string | null;
        updatedAt: Date;
        password: string;
        fcm: string | null;
        address: string;
        role: string;
        latitude: import("generated/prisma/runtime/library").Decimal | null;
        longitude: import("generated/prisma/runtime/library").Decimal | null;
    } | null>;
    create(data: CreateUserDto): Promise<{
        id: number;
        name: string;
        image: string;
        state: string;
        phone: string;
        isActive: boolean;
        officialDocuments: string | null;
        createdAt: Date;
        email: string | null;
        updatedAt: Date;
        password: string;
        fcm: string | null;
        address: string;
        role: string;
        latitude: import("generated/prisma/runtime/library").Decimal | null;
        longitude: import("generated/prisma/runtime/library").Decimal | null;
    }>;
    findAll(): Promise<{
        id: number;
        name: string;
        image: string;
        state: string;
        phone: string;
        isActive: boolean;
        officialDocuments: string | null;
        createdAt: Date;
        email: string | null;
        updatedAt: Date;
        password: string;
        fcm: string | null;
        address: string;
        role: string;
        latitude: import("generated/prisma/runtime/library").Decimal | null;
        longitude: import("generated/prisma/runtime/library").Decimal | null;
    }[]>;
    findById(id: number): Promise<{
        id: number;
        name: string;
        image: string;
        state: string;
        phone: string;
        isActive: boolean;
        officialDocuments: string | null;
        createdAt: Date;
        email: string | null;
        updatedAt: Date;
        password: string;
        fcm: string | null;
        address: string;
        role: string;
        latitude: import("generated/prisma/runtime/library").Decimal | null;
        longitude: import("generated/prisma/runtime/library").Decimal | null;
    }>;
    update(id: number, data: UpdateUserDto): Promise<{
        id: number;
        name: string;
        image: string;
        state: string;
        phone: string;
        isActive: boolean;
        officialDocuments: string | null;
        createdAt: Date;
        email: string | null;
        updatedAt: Date;
        password: string;
        fcm: string | null;
        address: string;
        role: string;
        latitude: import("generated/prisma/runtime/library").Decimal | null;
        longitude: import("generated/prisma/runtime/library").Decimal | null;
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
    getProfile(userId: number): Promise<{
        user: {
            id: number;
            name: string;
            image: string;
            state: string;
            phone: string;
            isActive: boolean;
            officialDocuments: string | null;
            createdAt: Date;
            email: string | null;
            updatedAt: Date;
            address: string;
            role: string;
        };
        systemInfo: {
            socialMedia: {
                whatsapp: string | null;
                instagram: string | null;
                facebook: string | null;
                tiktok: string | null;
                snapchat: string | null;
            };
            legalDocuments: {
                terms_en: string | null;
                terms_ar: string | null;
                privacy_en: string | null;
                privacy_ar: string | null;
            };
            support: {
                whatsapp_support: string | null;
            };
        };
    }>;
    updateFCMToken(userId: number, fcmToken: string): Promise<any>;
    removeFCMToken(userId: number): Promise<any>;
}

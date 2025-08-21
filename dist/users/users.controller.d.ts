import { FilesService } from '../files/files.service';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersController {
    private readonly usersService;
    private readonly filesService;
    constructor(usersService: UsersService, filesService: FilesService);
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
    getProfile(req: any): Promise<{
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
    findOne(id: string): Promise<{
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
    create(createUserDto: CreateUserDto, file: Express.Multer.File): Promise<{
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
    update(id: string, data: UpdateUserDto, req: any, file: Express.Multer.File): Promise<{
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
    } | {
        error: string;
    }>;
    remove(id: string, req: any): Promise<{
        message: string;
    } | {
        error: string;
    }>;
}

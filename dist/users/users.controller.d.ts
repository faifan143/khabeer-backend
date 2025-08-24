import { FilesService } from '../files/files.service';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserLocationDto } from './dto/create-user-location.dto';
import { UpdateUserLocationDto } from './dto/update-user-location.dto';
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
                whatsapp: null;
                instagram: null;
                facebook: null;
                tiktok: null;
                snapchat: null;
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
        fcm: string | null;
        address: string;
        role: string;
        latitude: import("generated/prisma/runtime/library").Decimal | null;
        longitude: import("generated/prisma/runtime/library").Decimal | null;
    } | {
        error: string;
    }>;
    remove(id: string, req: any): Promise<{
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
        fcm: string | null;
        address: string;
        role: string;
        latitude: import("generated/prisma/runtime/library").Decimal | null;
        longitude: import("generated/prisma/runtime/library").Decimal | null;
    } | {
        error: string;
    }>;
    getUserLocations(req: any): Promise<{
        id: number;
        title: string;
        description: string | null;
        latitude: number;
        longitude: number;
        address: string | null;
        isDefault: boolean;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    createUserLocation(createLocationDto: CreateUserLocationDto, req: any): Promise<{
        id: number;
        title: string;
        description: string | null;
        latitude: number;
        longitude: number;
        address: string | null;
        isDefault: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateUserLocation(id: string, updateLocationDto: UpdateUserLocationDto, req: any): Promise<{
        id: number;
        title: string;
        description: string | null;
        latitude: number;
        longitude: number;
        address: string | null;
        isDefault: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    deleteUserLocation(id: string, req: any): Promise<{
        message: string;
    }>;
    setDefaultLocation(id: string, req: any): Promise<{
        id: number;
        title: string;
        description: string | null;
        latitude: number;
        longitude: number;
        address: string | null;
        isDefault: boolean;
        createdAt: Date;
        updatedAt: Date;
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
        fcm: string | null;
        address: string;
        role: string;
        latitude: import("generated/prisma/runtime/library").Decimal | null;
        longitude: import("generated/prisma/runtime/library").Decimal | null;
    }>;
}

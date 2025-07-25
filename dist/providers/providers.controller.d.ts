import { FilesService } from '../files/files.service';
import { ProvidersService } from './providers.service';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
export declare class ProvidersController {
    private readonly providersService;
    private readonly filesService;
    constructor(providersService: ProvidersService, filesService: FilesService);
    findAll(): Promise<{
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
    }[]>;
    findOne(id: string): Promise<{
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
    register(data: CreateProviderDto, file: Express.Multer.File): Promise<{
        providerServices: {
            isActive: boolean;
            id: number;
            providerId: number;
            serviceId: number;
            price: number;
        }[];
    } & {
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
    create(data: CreateProviderDto): Promise<{
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
    update(id: string, data: UpdateProviderDto): Promise<{
        providerServices: {
            isActive: boolean;
            id: number;
            providerId: number;
            serviceId: number;
            price: number;
        }[];
    } & {
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
    remove(id: string): Promise<{
        message: string;
    }>;
    getProviderServices(id: string, req: any): Promise<({
        service: {
            image: string;
            id: number;
            description: string;
            title: string;
            commission: number;
            whatsapp: string;
            categoryId: number | null;
        };
    } & {
        isActive: boolean;
        id: number;
        providerId: number;
        serviceId: number;
        price: number;
    })[]>;
    addServices(id: string, body: {
        serviceIds: number[];
    }, req: any): Promise<({
        providerServices: {
            isActive: boolean;
            id: number;
            providerId: number;
            serviceId: number;
            price: number;
        }[];
    } & {
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
    }) | null>;
    removeServices(id: string, body: {
        serviceIds: number[];
    }, req: any): Promise<({
        providerServices: {
            isActive: boolean;
            id: number;
            providerId: number;
            serviceId: number;
            price: number;
        }[];
    } & {
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
    }) | null>;
}

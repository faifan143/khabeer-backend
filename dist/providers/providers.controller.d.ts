import { FilesService } from '../files/files.service';
import { ProvidersService } from './providers.service';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
export declare class ProvidersController {
    private readonly providersService;
    private readonly filesService;
    constructor(providersService: ProvidersService, filesService: FilesService);
    findAll(): Promise<{
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
    }[]>;
    findOne(id: string): Promise<{
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
    getStatus(id: string, req: any): Promise<{
        isActive: boolean;
    }>;
    register(data: CreateProviderDto, file: Express.Multer.File): Promise<{
        providerServices: {
            id: number;
            isActive: boolean;
            price: number;
            serviceId: number;
            providerId: number;
        }[];
    } & {
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
    create(createProviderDto: CreateProviderDto, file: Express.Multer.File): Promise<{
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
    update(id: string, data: UpdateProviderDto): Promise<{
        providerServices: {
            id: number;
            isActive: boolean;
            price: number;
            serviceId: number;
            providerId: number;
        }[];
    } & {
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
    updateStatus(id: string, data: UpdateStatusDto, req: any): Promise<{
        providerServices: {
            id: number;
            isActive: boolean;
            price: number;
            serviceId: number;
            providerId: number;
        }[];
    } & {
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
    remove(id: string): Promise<{
        message: string;
    }>;
    getProviderServices(id: string, req: any): Promise<({
        service: {
            id: number;
            image: string;
            description: string;
            title: string;
            commission: number;
            whatsapp: string;
            categoryId: number | null;
        };
    } & {
        id: number;
        isActive: boolean;
        price: number;
        serviceId: number;
        providerId: number;
    })[]>;
    addServices(id: string, body: {
        serviceIds: number[];
    }, req: any): Promise<({
        providerServices: {
            id: number;
            isActive: boolean;
            price: number;
            serviceId: number;
            providerId: number;
        }[];
    } & {
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
    }) | null>;
    removeServices(id: string, body: {
        serviceIds: number[];
    }, req: any): Promise<({
        providerServices: {
            id: number;
            isActive: boolean;
            price: number;
            serviceId: number;
            providerId: number;
        }[];
    } & {
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
    }) | null>;
}

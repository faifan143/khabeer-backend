import { PrismaService } from '../prisma/prisma.service';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
export declare class ProvidersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
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
    findByEmail(email: string): Promise<{
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
    } | null>;
    findById(id: number): Promise<{
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
    create(data: CreateProviderDto): Promise<{
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
    registerProviderWithServices(data: CreateProviderDto): Promise<{
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
    update(id: number, data: UpdateProviderDto): Promise<{
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
    updateStatus(id: number, isActive: boolean): Promise<{
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
    addServices(providerId: number, serviceIds: number[]): Promise<({
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
    removeServices(providerId: number, serviceIds: number[]): Promise<({
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
    getProviderServices(providerId: number): Promise<({
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
    remove(id: number): Promise<{
        message: string;
    }>;
}

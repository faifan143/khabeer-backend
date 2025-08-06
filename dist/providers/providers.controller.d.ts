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
        fcmToken: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string): Promise<{
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
        fcmToken: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getStatus(id: string, req: any): Promise<{
        isActive: boolean;
    }>;
    register(data: CreateProviderDto, file: Express.Multer.File): Promise<{
        providerServices: {
            serviceId: number;
            id: number;
            isActive: boolean;
            providerId: number;
            price: number;
        }[];
    } & {
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
        fcmToken: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(createProviderDto: CreateProviderDto, file: Express.Multer.File): Promise<{
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
        fcmToken: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, data: UpdateProviderDto, file: Express.Multer.File): Promise<{
        providerServices: {
            serviceId: number;
            id: number;
            isActive: boolean;
            providerId: number;
            price: number;
        }[];
    } & {
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
        fcmToken: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateStatus(id: string, data: UpdateStatusDto, req: any): Promise<{
        providerServices: {
            serviceId: number;
            id: number;
            isActive: boolean;
            providerId: number;
            price: number;
        }[];
    } & {
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
        fcmToken: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
    getProviderServices(id: string, req: any): Promise<({
        service: {
            description: string;
            id: number;
            image: string;
            title: string;
            commission: number;
            whatsapp: string;
            categoryId: number | null;
        };
    } & {
        serviceId: number;
        id: number;
        isActive: boolean;
        providerId: number;
        price: number;
    })[]>;
    addServices(id: string, body: {
        serviceIds: number[];
    }, req: any): Promise<({
        providerServices: {
            serviceId: number;
            id: number;
            isActive: boolean;
            providerId: number;
            price: number;
        }[];
    } & {
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
        fcmToken: string | null;
        createdAt: Date;
        updatedAt: Date;
    }) | null>;
    removeServices(id: string, body: {
        serviceIds: number[];
    }, req: any): Promise<({
        providerServices: {
            serviceId: number;
            id: number;
            isActive: boolean;
            providerId: number;
            price: number;
        }[];
    } & {
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
        fcmToken: string | null;
        createdAt: Date;
        updatedAt: Date;
    }) | null>;
    getProviderOrders(id: string, req: any): Promise<({
        service: {
            description: string;
            id: number;
            title: string;
        };
        user: {
            id: number;
            name: string;
            email: string;
            phone: string;
        };
    } & {
        serviceId: number;
        id: number;
        location: string | null;
        providerId: number;
        scheduledDate: Date | null;
        locationDetails: string | null;
        quantity: number;
        providerLocation: import("generated/prisma/runtime/library").JsonValue | null;
        status: string;
        bookingId: string;
        userId: number;
        orderDate: Date;
        totalAmount: number;
        providerAmount: number;
        commissionAmount: number;
    })[]>;
    getProviderRatings(id: string, req: any): Promise<({
        user: {
            id: number;
            name: string;
            email: string;
        };
    } & {
        id: number;
        providerId: number;
        userId: number;
        orderId: number | null;
        rating: number;
        comment: string | null;
        ratingDate: Date;
    })[]>;
    getProviderDocuments(id: string, req: any): Promise<{
        documents: {
            id: string;
            name: string;
            url: string;
            type: string;
            size: number;
            uploadedAt: string;
            uploadedBy: string;
        }[];
        verificationStatus: string;
        adminNotes: string | null;
    }>;
}

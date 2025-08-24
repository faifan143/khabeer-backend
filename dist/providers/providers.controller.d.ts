import { FilesService } from '../files/files.service';
import { ProvidersService } from './providers.service';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { ProvidersByServiceResponseDto } from './dto/providers-by-service-response.dto';
export declare class ProvidersController {
    private readonly providersService;
    private readonly filesService;
    constructor(providersService: ProvidersService, filesService: FilesService);
    findAll(): Promise<{
        averageRating: number;
        totalRatings: number;
        description: string;
        id: number;
        name: string;
        image: string;
        state: string;
        phone: string;
        isActive: boolean;
        isVerified: boolean;
        location: import("generated/prisma/runtime/library").JsonValue;
        createdAt: Date;
    }[]>;
    getProvidersByService(serviceId: string): Promise<ProvidersByServiceResponseDto>;
    getProfile(req: any): Promise<{
        provider: {
            description: string;
            id: number;
            name: string;
            image: string;
            state: string;
            phone: string;
            isActive: boolean;
            officialDocuments: string | null;
            isVerified: boolean;
            location: import("generated/prisma/runtime/library").JsonValue;
            createdAt: Date;
            email: string | null;
            updatedAt: Date;
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
    findOne(id: string): Promise<{
        description: string;
        id: number;
        name: string;
        image: string;
        state: string;
        phone: string;
        isActive: boolean;
        officialDocuments: string | null;
        isVerified: boolean;
        location: import("generated/prisma/runtime/library").JsonValue | null;
        createdAt: Date;
        email: string | null;
        updatedAt: Date;
        password: string | null;
        fcm: string | null;
    }>;
    getProviderFullDetails(id: number): Promise<import("./dto/provider-full-details.dto").ProviderFullDetailsDto>;
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
        image: string;
        state: string;
        phone: string;
        isActive: boolean;
        officialDocuments: string | null;
        isVerified: boolean;
        location: import("generated/prisma/runtime/library").JsonValue | null;
        createdAt: Date;
        email: string | null;
        updatedAt: Date;
        password: string | null;
        fcm: string | null;
    }>;
    create(createProviderDto: CreateProviderDto, file: Express.Multer.File): Promise<{
        description: string;
        id: number;
        name: string;
        image: string;
        state: string;
        phone: string;
        isActive: boolean;
        officialDocuments: string | null;
        isVerified: boolean;
        location: import("generated/prisma/runtime/library").JsonValue | null;
        createdAt: Date;
        email: string | null;
        updatedAt: Date;
        password: string | null;
        fcm: string | null;
    }>;
    update(id: string, data: UpdateProviderDto, file: Express.Multer.File, req: any): Promise<{
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
        image: string;
        state: string;
        phone: string;
        isActive: boolean;
        officialDocuments: string | null;
        isVerified: boolean;
        location: import("generated/prisma/runtime/library").JsonValue | null;
        createdAt: Date;
        email: string | null;
        updatedAt: Date;
        password: string | null;
        fcm: string | null;
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
        image: string;
        state: string;
        phone: string;
        isActive: boolean;
        officialDocuments: string | null;
        isVerified: boolean;
        location: import("generated/prisma/runtime/library").JsonValue | null;
        createdAt: Date;
        email: string | null;
        updatedAt: Date;
        password: string | null;
        fcm: string | null;
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
    getCategoryServicesByProviderId(providerId: number, categoryId: number): Promise<{
        categoryId: number;
        categoryName: string;
        providerId: number;
        providerName: string;
        services: {
            id: number;
            title: string;
            description: string;
            image: string;
            commission: number;
            categoryId: number;
            providerService: {
                id: number;
                price: number;
                isActive: boolean;
            };
            activeOffer: {
                startDate: Date;
                endDate: Date;
                originalPrice: number;
                offerPrice: number;
                description: string;
                id: number;
            } | null;
        }[];
        total: number;
    }>;
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
        image: string;
        state: string;
        phone: string;
        isActive: boolean;
        officialDocuments: string | null;
        isVerified: boolean;
        location: import("generated/prisma/runtime/library").JsonValue | null;
        createdAt: Date;
        email: string | null;
        updatedAt: Date;
        password: string | null;
        fcm: string | null;
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
        image: string;
        state: string;
        phone: string;
        isActive: boolean;
        officialDocuments: string | null;
        isVerified: boolean;
        location: import("generated/prisma/runtime/library").JsonValue | null;
        createdAt: Date;
        email: string | null;
        updatedAt: Date;
        password: string | null;
        fcm: string | null;
    }) | null>;
    getProviderOrders(id: string, req: any): Promise<import("./dto/provider-orders-response.dto").ProviderOrdersResponseDto>;
    getProviderOrdersByStatus(id: string, status: string, req: any): Promise<import("./dto/provider-orders-response.dto").ProviderOrdersResponseDto>;
    getProviderRatings(id: string, req: any): Promise<({
        user: {
            id: number;
            name: string;
            email: string | null;
            latitude: import("generated/prisma/runtime/library").Decimal | null;
            longitude: import("generated/prisma/runtime/library").Decimal | null;
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
    getTopProviders(limit?: string, minRating?: string, minOrders?: string, includeUnrated?: string): Promise<{
        providers: {
            rank: number;
            averageRating: number;
            totalRatings: number;
            totalOrders: number;
            completedOrders: number;
            totalRevenue: number;
            activeServices: number;
            tier: "active" | "top-rated" | "verified" | "new";
            score: number;
            orders: {
                id: number;
                status: string;
                orderDate: Date;
                totalAmount: number;
            }[];
            ratings: {
                rating: number;
            }[];
            providerServices: ({
                service: {
                    category: {
                        id: number;
                        image: string;
                        state: string;
                        titleAr: string;
                        titleEn: string;
                    } | null;
                } & {
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
            })[];
            description: string;
            id: number;
            name: string;
            image: string;
            state: string;
            phone: string;
            isActive: boolean;
            officialDocuments: string | null;
            isVerified: boolean;
            location: import("generated/prisma/runtime/library").JsonValue | null;
            createdAt: Date;
            email: string | null;
            updatedAt: Date;
            password: string | null;
            fcm: string | null;
        }[];
        total: number;
        summary: {
            topRated: number;
            active: number;
            verified: number;
            new: number;
        };
        filters: {
            limit: number;
            minRating: number;
            minOrders: number;
            includeUnrated: boolean;
        };
    }>;
}

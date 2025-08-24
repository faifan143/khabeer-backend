import { PrismaService } from '../prisma/prisma.service';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { ProviderOrdersResponseDto } from './dto/provider-orders-response.dto';
import { ProvidersByServiceResponseDto } from './dto/providers-by-service-response.dto';
import { ProviderFullDetailsDto } from './dto/provider-full-details.dto';
export declare class ProvidersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
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
    findByEmail(email: string): Promise<{
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
    } | null>;
    findByPhone(phone: string): Promise<{
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
    } | null>;
    findById(id: number): Promise<{
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
    getProfile(providerId: number): Promise<{
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
    create(data: CreateProviderDto): Promise<{
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
    registerProviderWithServices(data: CreateProviderDto): Promise<{
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
    update(id: number, data: UpdateProviderDto): Promise<{
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
    updateStatus(id: number, isActive: boolean): Promise<{
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
    addServices(providerId: number, serviceIds: number[]): Promise<({
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
    removeServices(providerId: number, serviceIds: number[]): Promise<({
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
    getProviderServices(providerId: number): Promise<({
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
    getProviderOrders(providerId: number): Promise<ProviderOrdersResponseDto>;
    getProviderOrdersByStatus(providerId: number, status: string): Promise<ProviderOrdersResponseDto>;
    getProviderRatings(providerId: number): Promise<({
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
    getProviderDocuments(providerId: number): Promise<{
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
    private getFileTypeFromUrl;
    findProvidersByServiceId(serviceId: number): Promise<ProvidersByServiceResponseDto>;
    remove(id: number): Promise<{
        message: string;
    }>;
    updateFCMToken(providerId: number, fcmToken: string): Promise<any>;
    removeFCMToken(providerId: number): Promise<any>;
    getProviderFullDetails(providerId: number): Promise<ProviderFullDetailsDto>;
    private getActiveOffer;
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
    getTopProviders(limit?: number, minRating?: number, minOrders?: number, includeUnrated?: boolean): Promise<{
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

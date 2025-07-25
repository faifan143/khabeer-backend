import { PrismaService } from '../prisma/prisma.service';
export interface SearchFilters {
    query?: string;
    categoryId?: number;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    location?: string;
    isVerified?: boolean;
}
export declare class SearchService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    searchServices(filters: SearchFilters): Promise<{
        providerServices: ({
            provider: {
                name: string;
                image: string;
                id: number;
                ratings: {
                    rating: number;
                }[];
                description: string;
                isVerified: boolean;
            };
        } & {
            isActive: boolean;
            id: number;
            providerId: number;
            serviceId: number;
            price: number;
        })[];
        category: {
            image: string;
            state: string;
            id: number;
            titleAr: string;
            titleEn: string;
        } | null;
        image: string;
        id: number;
        description: string;
        title: string;
        commission: number;
        whatsapp: string;
        categoryId: number | null;
    }[]>;
    searchProviders(filters: SearchFilters): Promise<{
        providerServices: ({
            service: {
                category: {
                    image: string;
                    state: string;
                    id: number;
                    titleAr: string;
                    titleEn: string;
                } | null;
            } & {
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
        })[];
        averageRating: number;
        ratings: {
            rating: number;
        }[];
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
    searchByLocation(location: string): Promise<{
        averageRating: number;
        ratings: {
            rating: number;
        }[];
        providerServices: ({
            service: {
                category: {
                    image: string;
                    state: string;
                    id: number;
                    titleAr: string;
                    titleEn: string;
                } | null;
            } & {
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
        })[];
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
    getPopularServices(limit?: number): Promise<{
        orderCount: number;
        category: {
            image: string;
            state: string;
            id: number;
            titleAr: string;
            titleEn: string;
        } | null;
        orders: {
            id: number;
            providerId: number;
            serviceId: number;
            scheduledDate: Date | null;
            location: string | null;
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
        }[];
        providerServices: ({
            provider: {
                name: string;
                image: string;
                id: number;
                isVerified: boolean;
            };
        } & {
            isActive: boolean;
            id: number;
            providerId: number;
            serviceId: number;
            price: number;
        })[];
        image: string;
        id: number;
        description: string;
        title: string;
        commission: number;
        whatsapp: string;
        categoryId: number | null;
    }[]>;
    getTopRatedProviders(limit?: number): Promise<{
        averageRating: number;
        ratings: {
            rating: number;
        }[];
        providerServices: ({
            service: {
                category: {
                    image: string;
                    state: string;
                    id: number;
                    titleAr: string;
                    titleEn: string;
                } | null;
            } & {
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
        })[];
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
    private calculateAverageRating;
}

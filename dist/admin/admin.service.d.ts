import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
export declare class AdminService {
    private readonly prisma;
    private readonly notificationsService;
    constructor(prisma: PrismaService, notificationsService: NotificationsService);
    getDashboardStats(): Promise<{
        overview: {
            totalUsers: number;
            totalProviders: number;
            totalOrders: number;
            totalRevenue: number;
            totalCommission: number;
        };
        pending: {
            verifications: number;
            joinRequests: number;
        };
        active: {
            users: number;
            providers: number;
            completedOrders: number;
        };
        popularServices: {
            id: number;
            name: string;
            description: string;
            price: number;
            category: {
                id: number;
                name: string;
            } | null;
            orderCount: number;
        }[];
        topProviders: {
            id: number;
            name: string;
            email: string;
            phone: string;
            description: string;
            image: string;
            state: string;
            isActive: boolean;
            isVerified: boolean;
            orderCount: number;
            rating: number;
        }[];
        orderStats: {
            total: number;
            today: number;
            yesterday: number;
            thisWeek: number;
            thisMonth: number;
            byStatus: {
                status: string;
                count: number;
            }[];
        };
    }>;
    getOverviewStats(days?: number): Promise<{
        period: string;
        newUsers: number;
        newProviders: number;
        newOrders: number;
        newRevenue: number;
    }>;
    getRevenueStats(startDate?: Date, endDate?: Date): Promise<{
        totalRevenue: number;
        totalTransactions: number;
        totalCommission: number;
        netRevenue: number;
    }>;
    getUserStats(): Promise<{
        total: number;
        active: number;
        inactive: number;
    }>;
    getProviderStats(): Promise<{
        total: number;
        active: number;
        inactive: number;
        verified: number;
        unverified: number;
        topProviders: {
            id: number;
            name: string;
            email: string | null;
            phone: string;
            description: string;
            image: string;
            state: string;
            isActive: boolean;
            isVerified: boolean;
            orderCount: number;
            rating: number;
        }[];
    }>;
    getOrderStats(): Promise<{
        total: number;
        today: number;
        yesterday: number;
        thisWeek: number;
        thisMonth: number;
        byStatus: {
            status: string;
            count: number;
        }[];
    }>;
    getServiceStats(): Promise<{
        total: number;
        popularServices: {
            orderCount: number;
            category: {
                id: number;
                image: string;
                state: string;
                titleAr: string;
                titleEn: string;
            } | null;
            orders: {
                status: string;
                id: number;
                bookingId: string;
                userId: number;
                providerId: number;
                serviceId: number;
                orderDate: Date;
                scheduledDate: Date | null;
                location: string | null;
                locationDetails: string | null;
                providerLocation: import("generated/prisma/runtime/library").JsonValue | null;
                quantity: number;
                totalAmount: number;
                providerAmount: number;
                commissionAmount: number;
            }[];
            title: string;
            id: number;
            description: string;
            image: string;
            commission: number;
            whatsapp: string;
            categoryId: number | null;
        }[];
    }>;
    getPendingVerifications(): Promise<({
        provider: {
            id: number;
            name: string;
            description: string;
            image: string;
            phone: string;
        };
    } & {
        status: string;
        createdAt: Date;
        updatedAt: Date;
        id: string;
        providerId: number;
        documents: string[];
        adminNotes: string | null;
    })[]>;
    getPendingJoinRequests(): Promise<({
        provider: {
            id: number;
            name: string;
            description: string;
            image: string;
            phone: string;
        };
    } & {
        status: string;
        id: number;
        providerId: number;
        adminNotes: string | null;
        requestDate: Date;
    })[]>;
    getAllProviders(): Promise<({
        _count: {
            providerServices: number;
            orders: number;
            ratings: number;
        };
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
                title: string;
                id: number;
                description: string;
                image: string;
                commission: number;
                whatsapp: string;
                categoryId: number | null;
            };
        } & {
            id: number;
            providerId: number;
            serviceId: number;
            isActive: boolean;
            price: number;
        })[];
        offers: {
            id: number;
            originalPrice: number;
            offerPrice: number;
        }[];
        orders: {
            id: number;
            totalAmount: number;
            providerAmount: number;
            commissionAmount: number;
        }[];
    } & {
        createdAt: Date;
        updatedAt: Date;
        id: number;
        name: string;
        location: import("generated/prisma/runtime/library").JsonValue | null;
        description: string;
        isActive: boolean;
        image: string;
        email: string | null;
        password: string | null;
        state: string;
        phone: string;
        isVerified: boolean;
        officialDocuments: string | null;
    })[]>;
    getUnverifiedProviders(): Promise<({
        _count: {
            providerServices: number;
        };
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
                title: string;
                id: number;
                description: string;
                image: string;
                commission: number;
                whatsapp: string;
                categoryId: number | null;
            };
        } & {
            id: number;
            providerId: number;
            serviceId: number;
            isActive: boolean;
            price: number;
        })[];
    } & {
        createdAt: Date;
        updatedAt: Date;
        id: number;
        name: string;
        location: import("generated/prisma/runtime/library").JsonValue | null;
        description: string;
        isActive: boolean;
        image: string;
        email: string | null;
        password: string | null;
        state: string;
        phone: string;
        isVerified: boolean;
        officialDocuments: string | null;
    })[]>;
    approveVerification(id: string, notes?: string): Promise<{
        message: string;
    }>;
    rejectVerification(id: string, notes: string): Promise<{
        message: string;
    }>;
    approveJoinRequest(id: number, notes?: string): Promise<{
        message: string;
    }>;
    rejectJoinRequest(id: number, notes: string): Promise<{
        message: string;
    }>;
    activateUser(id: number): Promise<{
        message: string;
    }>;
    deactivateUser(id: number): Promise<{
        message: string;
    }>;
    getAllRatings(): Promise<{
        order: {
            id: number;
            bookingId: string;
            totalAmount: number;
            service: {
                title: string;
                id: number;
                category: {
                    id: number;
                    titleAr: string;
                    titleEn: string;
                } | null;
            };
        } | null;
        user: {
            id: number;
            name: string;
            image: string;
            email: string;
        };
        provider: {
            id: number;
            name: string;
            image: string;
            email: string | null;
        };
        id: number;
        userId: number;
        providerId: number;
        orderId: number | null;
        rating: number;
        comment: string | null;
        ratingDate: Date;
    }[]>;
    activateProvider(id: number): Promise<{
        message: string;
    }>;
    deactivateProvider(id: number): Promise<{
        message: string;
    }>;
    verifyProvider(id: number): Promise<{
        message: string;
        provider: {
            id: number;
            name: string;
            email: string | null;
        };
    }>;
    unverifyProvider(id: number): Promise<{
        message: string;
    }>;
    getOrderReport(startDate?: Date, endDate?: Date): Promise<{
        orderId: number;
        bookingId: string;
        status: string;
        orderDate: Date;
        totalAmount: number;
        commissionAmount: number;
        user: {
            id: number;
            name: string;
            email: string;
        };
        provider: {
            id: number;
            name: string;
            phone: string;
        };
        service: {
            title: string;
            id: number;
            commission: number;
        };
        paymentStatus: string | undefined;
    }[]>;
    getRevenueReport(startDate?: Date, endDate?: Date): Promise<{
        invoiceId: number;
        orderId: number;
        paymentDate: Date | null;
        totalAmount: number;
        discount: number;
        netAmount: number;
        commission: number;
        user: {
            name: string;
            email: string;
        };
        provider: {
            name: string;
            phone: string;
        };
        service: {
            title: string;
            commission: number;
        };
    }[]>;
    getProviderReport(startDate?: Date, endDate?: Date): Promise<{
        providerId: number;
        name: string;
        phone: string;
        isActive: boolean;
        isVerified: boolean;
        createdAt: Date;
        services: number;
        completedOrders: number;
        averageRating: number;
        verificationStatus: string;
    }[]>;
    getUserReport(startDate?: Date, endDate?: Date): Promise<{
        userId: number;
        name: string;
        email: string;
        phone: string;
        role: string;
        isActive: boolean;
        createdAt: Date;
        completedOrders: number;
        totalSpent: number;
        ratingsGiven: number;
        address: string;
        state: string;
        image: string;
    }[]>;
    getAllOrders(page?: number, limit?: number): Promise<{
        data: ({
            user: {
                id: number;
                name: string;
                email: string;
                phone: string;
            };
            provider: {
                id: number;
                name: string;
                email: string | null;
                phone: string;
            };
            service: {
                title: string;
                id: number;
                description: string;
                commission: number;
            };
            invoice: {
                id: number;
                totalAmount: number;
                orderId: number;
                paymentStatus: string;
                isVerified: boolean;
                discount: number;
                verifiedBy: number | null;
                paymentDate: Date | null;
                paymentMethod: string | null;
                verifiedAt: Date | null;
                payoutStatus: string;
                payoutDate: Date | null;
            } | null;
        } & {
            status: string;
            id: number;
            bookingId: string;
            userId: number;
            providerId: number;
            serviceId: number;
            orderDate: Date;
            scheduledDate: Date | null;
            location: string | null;
            locationDetails: string | null;
            providerLocation: import("generated/prisma/runtime/library").JsonValue | null;
            quantity: number;
            totalAmount: number;
            providerAmount: number;
            commissionAmount: number;
        })[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    updateOrderStatus(id: number, status: string): Promise<{
        message: string;
        order: {
            user: {
                name: string;
                email: string;
            };
            provider: {
                name: string;
                email: string | null;
            };
            service: {
                title: string;
            };
        } & {
            status: string;
            id: number;
            bookingId: string;
            userId: number;
            providerId: number;
            serviceId: number;
            orderDate: Date;
            scheduledDate: Date | null;
            location: string | null;
            locationDetails: string | null;
            providerLocation: import("generated/prisma/runtime/library").JsonValue | null;
            quantity: number;
            totalAmount: number;
            providerAmount: number;
            commissionAmount: number;
        };
    }>;
    cancelOrder(id: number, reason?: string): Promise<{
        message: string;
        order: {
            user: {
                name: string;
                email: string;
            };
            provider: {
                name: string;
                email: string | null;
            };
            service: {
                title: string;
            };
        } & {
            status: string;
            id: number;
            bookingId: string;
            userId: number;
            providerId: number;
            serviceId: number;
            orderDate: Date;
            scheduledDate: Date | null;
            location: string | null;
            locationDetails: string | null;
            providerLocation: import("generated/prisma/runtime/library").JsonValue | null;
            quantity: number;
            totalAmount: number;
            providerAmount: number;
            commissionAmount: number;
        };
    }>;
    completeOrder(id: number): Promise<{
        message: string;
        order: {
            user: {
                name: string;
                email: string;
            };
            provider: {
                name: string;
                email: string | null;
            };
            service: {
                title: string;
            };
        } & {
            status: string;
            id: number;
            bookingId: string;
            userId: number;
            providerId: number;
            serviceId: number;
            orderDate: Date;
            scheduledDate: Date | null;
            location: string | null;
            locationDetails: string | null;
            providerLocation: import("generated/prisma/runtime/library").JsonValue | null;
            quantity: number;
            totalAmount: number;
            providerAmount: number;
            commissionAmount: number;
        };
    }>;
    acceptOrder(id: number, notes?: string): Promise<{
        message: string;
        order: {
            user: {
                name: string;
                email: string;
            };
            provider: {
                name: string;
                email: string | null;
            };
            service: {
                title: string;
            };
        } & {
            status: string;
            id: number;
            bookingId: string;
            userId: number;
            providerId: number;
            serviceId: number;
            orderDate: Date;
            scheduledDate: Date | null;
            location: string | null;
            locationDetails: string | null;
            providerLocation: import("generated/prisma/runtime/library").JsonValue | null;
            quantity: number;
            totalAmount: number;
            providerAmount: number;
            commissionAmount: number;
        };
    }>;
    rejectOrder(id: number, reason: string): Promise<{
        message: string;
        order: {
            user: {
                name: string;
                email: string;
            };
            provider: {
                name: string;
                email: string | null;
            };
            service: {
                title: string;
            };
        } & {
            status: string;
            id: number;
            bookingId: string;
            userId: number;
            providerId: number;
            serviceId: number;
            orderDate: Date;
            scheduledDate: Date | null;
            location: string | null;
            locationDetails: string | null;
            providerLocation: import("generated/prisma/runtime/library").JsonValue | null;
            quantity: number;
            totalAmount: number;
            providerAmount: number;
            commissionAmount: number;
        };
    }>;
    getSystemSettings(category?: string): Promise<{}>;
    updateSystemSetting(key: string, value: string, description?: string, category?: string): Promise<{
        createdAt: Date;
        updatedAt: Date;
        id: number;
        description: string | null;
        category: string;
        key: string;
        value: string;
    }>;
    getSubAdmins(): Promise<{
        permissions: any;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        name: string;
        isActive: boolean;
        email: string;
        password: string;
    }[]>;
    createSubAdmin(name: string, email: string, password: string, permissions: string[]): Promise<{
        permissions: any;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        name: string;
        isActive: boolean;
        email: string;
        password: string;
    }>;
    deleteSubAdmin(id: number): Promise<{
        message: string;
    }>;
    getAdBanners(): Promise<{
        title: string;
        imageUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        providerId: number | null;
        description: string;
        isActive: boolean;
        linkType: string;
        externalLink: string | null;
    }[]>;
    createAdBanner(data: {
        title: string;
        description: string;
        imageUrl?: string;
        linkType: string;
        externalLink?: string;
        providerId?: number;
        isActive: boolean | string;
    }): Promise<{
        title: string;
        imageUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        providerId: number | null;
        description: string;
        isActive: boolean;
        linkType: string;
        externalLink: string | null;
    }>;
    updateAdBanner(id: number, data: {
        title?: string;
        description?: string;
        imageUrl?: string;
        linkType?: string;
        externalLink?: string;
        providerId?: number;
        isActive?: boolean | string;
    }): Promise<{
        title: string;
        imageUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        providerId: number | null;
        description: string;
        isActive: boolean;
        linkType: string;
        externalLink: string | null;
    }>;
    deleteAdBanner(id: number): Promise<{
        message: string;
    }>;
    getAllNotifications(): Promise<{
        targetAudience: any;
        data: import("generated/prisma/runtime/library").JsonValue | null;
        title: string;
        message: string;
        imageUrl: string | null;
        notificationType: string;
        status: string;
        recipientsCount: number;
        successCount: number;
        failureCount: number;
        sentAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        id: number;
    }[]>;
    createNotification(data: {
        title: string;
        imageUrl?: string;
        targetAudience: string[];
    }): Promise<{
        targetAudience: import("generated/prisma/runtime/library").JsonValue;
        status: string;
        sentAt: Date;
        data: import("generated/prisma/runtime/library").JsonValue | null;
        title: string;
        message: string;
        imageUrl: string | null;
        notificationType: string;
        recipientsCount: number;
        successCount: number;
        failureCount: number;
        createdAt: Date;
        updatedAt: Date;
        id: number;
    }>;
    sendNotification(id: number): Promise<{
        targetAudience: any;
        data: import("generated/prisma/runtime/library").JsonValue | null;
        title: string;
        message: string;
        imageUrl: string | null;
        notificationType: string;
        status: string;
        recipientsCount: number;
        successCount: number;
        failureCount: number;
        sentAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        id: number;
    }>;
    deleteNotification(id: number): Promise<{
        message: string;
    }>;
}

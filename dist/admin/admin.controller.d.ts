import { AdminService } from './admin.service';
import { FilesService } from '../files/files.service';
export declare class AdminController {
    private readonly adminService;
    private readonly filesService;
    constructor(adminService: AdminService, filesService: FilesService);
    getDashboard(): Promise<{
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
    getOverview(period?: string): Promise<{
        period: string;
        newUsers: number;
        newProviders: number;
        newOrders: number;
        newRevenue: number;
    }>;
    getRevenueStats(startDate?: string, endDate?: string): Promise<{
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
    getAllProviders(): Promise<({
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
        orders: {
            id: number;
            totalAmount: number;
            providerAmount: number;
            commissionAmount: number;
        }[];
        offers: {
            originalPrice: number;
            offerPrice: number;
            id: number;
        }[];
        _count: {
            providerServices: number;
            orders: number;
            ratings: number;
        };
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
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    getUnverifiedProviders(): Promise<({
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
        _count: {
            providerServices: number;
        };
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
        createdAt: Date;
        updatedAt: Date;
    })[]>;
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
            }[];
            description: string;
            id: number;
            image: string;
            title: string;
            commission: number;
            whatsapp: string;
            categoryId: number | null;
        }[];
    }>;
    getPendingVerifications(): Promise<({
        provider: {
            description: string;
            id: number;
            name: string;
            image: string;
            phone: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        providerId: number;
        documents: string[];
        status: string;
        adminNotes: string | null;
    })[]>;
    getPendingJoinRequests(): Promise<({
        provider: {
            description: string;
            id: number;
            name: string;
            image: string;
            phone: string;
        };
    } & {
        id: number;
        providerId: number;
        status: string;
        adminNotes: string | null;
        requestDate: Date;
    })[]>;
    approveVerification(id: string, body: {
        notes?: string;
    }): Promise<{
        message: string;
    }>;
    rejectVerification(id: string, body: {
        notes: string;
    }): Promise<{
        message: string;
    }>;
    approveJoinRequest(id: number, body: {
        notes?: string;
    }): Promise<{
        message: string;
    }>;
    rejectJoinRequest(id: number, body: {
        notes: string;
    }): Promise<{
        message: string;
    }>;
    activateUser(id: number): Promise<{
        message: string;
    }>;
    deactivateUser(id: number): Promise<{
        message: string;
    }>;
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
    getOrderReport(startDate?: string, endDate?: string): Promise<{
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
            id: number;
            title: string;
            commission: number;
        };
        paymentStatus: string | undefined;
    }[]>;
    getRevenueReport(startDate?: string, endDate?: string): Promise<{
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
    getProviderReport(startDate?: string, endDate?: string): Promise<{
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
    getUserReport(startDate?: string, endDate?: string): Promise<{
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
    getAllRatings(): Promise<{
        order: {
            service: {
                category: {
                    id: number;
                    titleAr: string;
                    titleEn: string;
                } | null;
                id: number;
                title: string;
            };
            id: number;
            bookingId: string;
            totalAmount: number;
        } | null;
        provider: {
            id: number;
            name: string;
            email: string | null;
            image: string;
        };
        user: {
            id: number;
            name: string;
            email: string;
            image: string;
        };
        id: number;
        providerId: number;
        userId: number;
        orderId: number | null;
        rating: number;
        comment: string | null;
        ratingDate: Date;
    }[]>;
    getAllOrders(page?: string, limit?: string): Promise<{
        data: ({
            service: {
                description: string;
                id: number;
                title: string;
                commission: number;
            };
            provider: {
                id: number;
                name: string;
                email: string | null;
                phone: string;
            };
            user: {
                id: number;
                name: string;
                email: string;
                phone: string;
            };
            invoice: {
                id: number;
                isVerified: boolean;
                totalAmount: number;
                orderId: number;
                paymentDate: Date | null;
                discount: number;
                paymentStatus: string;
                paymentMethod: string | null;
                verifiedBy: number | null;
                verifiedAt: Date | null;
                payoutStatus: string;
                payoutDate: Date | null;
            } | null;
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
        })[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    updateOrderStatus(id: number, body: {
        status: string;
    }): Promise<{
        message: string;
        order: {
            service: {
                title: string;
            };
            provider: {
                name: string;
                email: string | null;
            };
            user: {
                name: string;
                email: string;
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
        };
    }>;
    cancelOrder(id: number, body: {
        reason?: string;
    }): Promise<{
        message: string;
        order: {
            service: {
                title: string;
            };
            provider: {
                name: string;
                email: string | null;
            };
            user: {
                name: string;
                email: string;
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
        };
    }>;
    completeOrder(id: number): Promise<{
        message: string;
        order: {
            service: {
                title: string;
            };
            provider: {
                name: string;
                email: string | null;
            };
            user: {
                name: string;
                email: string;
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
        };
    }>;
    acceptOrder(id: number, body: {
        notes?: string;
    }): Promise<{
        message: string;
        order: {
            service: {
                title: string;
            };
            provider: {
                name: string;
                email: string | null;
            };
            user: {
                name: string;
                email: string;
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
        };
    }>;
    rejectOrder(id: number, body: {
        reason: string;
    }): Promise<{
        message: string;
        order: {
            service: {
                title: string;
            };
            provider: {
                name: string;
                email: string | null;
            };
            user: {
                name: string;
                email: string;
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
        };
    }>;
    getSystemSettings(category?: string): Promise<{}>;
    updateSystemSetting(body: {
        key: string;
        value: string;
        description?: string;
        category?: string;
    }): Promise<{
        category: string;
        description: string | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        key: string;
        value: string;
    }>;
    uploadLegalDocuments(files: Express.Multer.File[]): Promise<{
        message: string;
        documents: {
            url: string;
            filename: string;
            originalName: string;
            size: number;
            mimetype: string;
        }[];
    }>;
    uploadBannerImage(file: Express.Multer.File): Promise<{
        message: string;
        image: import("../files/files.service").FileUploadResult;
    }>;
    getSubAdmins(): Promise<{
        permissions: any;
        id: number;
        name: string;
        email: string;
        password: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    createSubAdmin(body: {
        name: string;
        email: string;
        password: string;
        permissions: string[];
    }): Promise<{
        permissions: any;
        id: number;
        name: string;
        email: string;
        password: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    deleteSubAdmin(id: number): Promise<{
        message: string;
    }>;
    getAdBanners(): Promise<{
        description: string;
        id: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        providerId: number | null;
        imageUrl: string | null;
        linkType: string;
        externalLink: string | null;
    }[]>;
    createAdBanner(body: {
        title: string;
        description: string;
        linkType: string;
        externalLink?: string;
        providerId?: number;
        isActive: boolean;
    }, file: Express.Multer.File): Promise<{
        description: string;
        id: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        providerId: number | null;
        imageUrl: string | null;
        linkType: string;
        externalLink: string | null;
    }>;
    updateAdBanner(id: number, body: {
        title?: string;
        description?: string;
        linkType?: string;
        externalLink?: string;
        providerId?: number;
        isActive?: boolean;
    }, file: Express.Multer.File): Promise<{
        description: string;
        id: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        providerId: number | null;
        imageUrl: string | null;
        linkType: string;
        externalLink: string | null;
    }>;
    deleteAdBanner(id: number): Promise<{
        message: string;
    }>;
    getAllNotifications(): Promise<{
        targetAudience: any;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        message: string;
        status: string;
        sentAt: Date | null;
        imageUrl: string | null;
        recipientsCount: number;
    }[]>;
    createNotification(body: {
        title: string;
        message: string;
        targetAudience: string[];
    }, file: Express.Multer.File): Promise<{
        targetAudience: any;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        message: string;
        status: string;
        sentAt: Date | null;
        imageUrl: string | null;
        recipientsCount: number;
    }>;
    sendNotification(id: number): Promise<{
        targetAudience: any;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        message: string;
        status: string;
        sentAt: Date | null;
        imageUrl: string | null;
        recipientsCount: number;
    }>;
    deleteNotification(id: number): Promise<{
        message: string;
    }>;
}

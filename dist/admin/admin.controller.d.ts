import { AdminService } from './admin.service';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
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
                id: number;
                image: string;
                title: string;
                description: string;
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
        offers: {
            id: number;
            originalPrice: number;
            offerPrice: number;
        }[];
        orders: {
            totalAmount: number;
            commissionAmount: number;
            id: number;
            providerAmount: number;
        }[];
    } & {
        isActive: boolean;
        id: number;
        image: string;
        description: string;
        location: import("generated/prisma/runtime/library").JsonValue | null;
        name: string;
        email: string | null;
        password: string | null;
        state: string;
        phone: string;
        isVerified: boolean;
        officialDocuments: string | null;
        createdAt: Date;
        updatedAt: Date;
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
                id: number;
                image: string;
                title: string;
                description: string;
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
    } & {
        isActive: boolean;
        id: number;
        image: string;
        description: string;
        location: import("generated/prisma/runtime/library").JsonValue | null;
        name: string;
        email: string | null;
        password: string | null;
        state: string;
        phone: string;
        isVerified: boolean;
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
                totalAmount: number;
                status: string;
                commissionAmount: number;
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
                providerAmount: number;
            }[];
            id: number;
            image: string;
            title: string;
            description: string;
            commission: number;
            whatsapp: string;
            categoryId: number | null;
        }[];
    }>;
    getPendingVerifications(): Promise<({
        provider: {
            id: number;
            image: string;
            description: string;
            name: string;
            phone: string;
        };
    } & {
        status: string;
        id: string;
        providerId: number;
        createdAt: Date;
        updatedAt: Date;
        documents: string[];
        adminNotes: string | null;
    })[]>;
    getPendingJoinRequests(): Promise<({
        provider: {
            id: number;
            image: string;
            description: string;
            name: string;
            phone: string;
        };
    } & {
        status: string;
        id: number;
        providerId: number;
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
    getAllOrders(page?: string, limit?: string): Promise<{
        data: ({
            service: {
                id: number;
                title: string;
                description: string;
                commission: number;
            };
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
            invoice: {
                paymentStatus: string;
                totalAmount: number;
                id: number;
                isVerified: boolean;
                orderId: number;
                discount: number;
                verifiedBy: number | null;
                paymentDate: Date | null;
                paymentMethod: string | null;
                verifiedAt: Date | null;
                payoutStatus: string;
                payoutDate: Date | null;
            } | null;
        } & {
            totalAmount: number;
            status: string;
            commissionAmount: number;
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
            providerAmount: number;
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
            user: {
                name: string;
                email: string;
            };
            provider: {
                name: string;
                email: string | null;
            };
        } & {
            totalAmount: number;
            status: string;
            commissionAmount: number;
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
            providerAmount: number;
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
            user: {
                name: string;
                email: string;
            };
            provider: {
                name: string;
                email: string | null;
            };
        } & {
            totalAmount: number;
            status: string;
            commissionAmount: number;
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
            providerAmount: number;
        };
    }>;
    completeOrder(id: number): Promise<{
        message: string;
        order: {
            service: {
                title: string;
            };
            user: {
                name: string;
                email: string;
            };
            provider: {
                name: string;
                email: string | null;
            };
        } & {
            totalAmount: number;
            status: string;
            commissionAmount: number;
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
            providerAmount: number;
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
            user: {
                name: string;
                email: string;
            };
            provider: {
                name: string;
                email: string | null;
            };
        } & {
            totalAmount: number;
            status: string;
            commissionAmount: number;
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
            providerAmount: number;
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
            user: {
                name: string;
                email: string;
            };
            provider: {
                name: string;
                email: string | null;
            };
        } & {
            totalAmount: number;
            status: string;
            commissionAmount: number;
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
            providerAmount: number;
        };
    }>;
}

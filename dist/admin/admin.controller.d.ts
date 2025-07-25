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
    }>;
    getOrderStats(): Promise<{
        total: number;
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
            image: string;
            id: number;
            description: string;
            title: string;
            commission: number;
            whatsapp: string;
            categoryId: number | null;
        }[];
    }>;
    getPendingVerifications(): Promise<({
        provider: {
            name: string;
            image: string;
            phone: string;
            id: number;
            description: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        providerId: number;
        status: string;
        documents: string[];
        adminNotes: string | null;
    })[]>;
    getPendingJoinRequests(): Promise<({
        provider: {
            name: string;
            image: string;
            phone: string;
            id: number;
            description: string;
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
            name: string;
            email: string;
            id: number;
        };
        provider: {
            name: string;
            phone: string;
            id: number;
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
    }[]>;
}

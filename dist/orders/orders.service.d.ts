import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto, OrderStatus } from './dto/order-status.dto';
export declare class OrdersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(createOrderDto: CreateOrderDto, userId: number): Promise<{
        appliedOffer: {
            id: number;
            title: string;
            originalPrice: number;
            offerPrice: number;
            discount: number;
            savings: number;
        } | null;
        user: {
            id: number;
            isActive: boolean;
            name: string;
            email: string;
            password: string;
            image: string;
            state: string;
            phone: string;
            officialDocuments: string | null;
            createdAt: Date;
            updatedAt: Date;
            role: string;
            address: string;
        };
        provider: {
            id: number;
            location: import("generated/prisma/runtime/library").JsonValue | null;
            description: string;
            isActive: boolean;
            name: string;
            email: string | null;
            password: string | null;
            image: string;
            state: string;
            phone: string;
            isVerified: boolean;
            officialDocuments: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
        service: {
            id: number;
            description: string;
            image: string;
            title: string;
            commission: number;
            whatsapp: string;
            categoryId: number | null;
        };
        invoice: {
            id: number;
            totalAmount: number;
            isVerified: boolean;
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
        id: number;
        bookingId: string;
        userId: number;
        providerId: number;
        serviceId: number;
        status: string;
        orderDate: Date;
        scheduledDate: Date | null;
        location: string | null;
        locationDetails: string | null;
        providerLocation: import("generated/prisma/runtime/library").JsonValue | null;
        quantity: number;
        totalAmount: number;
        providerAmount: number;
        commissionAmount: number;
    }>;
    findAll(userId: number, role: string): Promise<({
        user: {
            id: number;
            name: string;
            email: string;
            phone: string;
        };
        provider: {
            id: number;
            name: string;
            image: string;
            phone: string;
        };
        service: {
            id: number;
            description: string;
            image: string;
            title: string;
        };
        invoice: {
            id: number;
            totalAmount: number;
            isVerified: boolean;
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
        id: number;
        bookingId: string;
        userId: number;
        providerId: number;
        serviceId: number;
        status: string;
        orderDate: Date;
        scheduledDate: Date | null;
        location: string | null;
        locationDetails: string | null;
        providerLocation: import("generated/prisma/runtime/library").JsonValue | null;
        quantity: number;
        totalAmount: number;
        providerAmount: number;
        commissionAmount: number;
    })[]>;
    findOne(id: number, userId: number, role: string): Promise<{
        user: {
            id: number;
            name: string;
            email: string;
            phone: string;
            address: string;
        };
        provider: {
            id: number;
            description: string;
            name: string;
            image: string;
            phone: string;
        };
        service: {
            id: number;
            description: string;
            image: string;
            title: string;
            commission: number;
        };
        invoice: {
            id: number;
            totalAmount: number;
            isVerified: boolean;
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
        id: number;
        bookingId: string;
        userId: number;
        providerId: number;
        serviceId: number;
        status: string;
        orderDate: Date;
        scheduledDate: Date | null;
        location: string | null;
        locationDetails: string | null;
        providerLocation: import("generated/prisma/runtime/library").JsonValue | null;
        quantity: number;
        totalAmount: number;
        providerAmount: number;
        commissionAmount: number;
    }>;
    updateStatus(id: number, updateStatusDto: UpdateOrderStatusDto, userId: number, role: string): Promise<{
        user: {
            id: number;
            name: string;
            email: string;
            phone: string;
        };
        provider: {
            id: number;
            name: string;
            image: string;
            phone: string;
        };
        service: {
            id: number;
            description: string;
            image: string;
            title: string;
        };
        invoice: {
            id: number;
            totalAmount: number;
            isVerified: boolean;
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
        id: number;
        bookingId: string;
        userId: number;
        providerId: number;
        serviceId: number;
        status: string;
        orderDate: Date;
        scheduledDate: Date | null;
        location: string | null;
        locationDetails: string | null;
        providerLocation: import("generated/prisma/runtime/library").JsonValue | null;
        quantity: number;
        totalAmount: number;
        providerAmount: number;
        commissionAmount: number;
    }>;
    cancel(id: number, userId: number, role: string): Promise<{
        user: {
            id: number;
            name: string;
            email: string;
            phone: string;
        };
        provider: {
            id: number;
            name: string;
            image: string;
            phone: string;
        };
        service: {
            id: number;
            description: string;
            image: string;
            title: string;
        };
        invoice: {
            id: number;
            totalAmount: number;
            isVerified: boolean;
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
        id: number;
        bookingId: string;
        userId: number;
        providerId: number;
        serviceId: number;
        status: string;
        orderDate: Date;
        scheduledDate: Date | null;
        location: string | null;
        locationDetails: string | null;
        providerLocation: import("generated/prisma/runtime/library").JsonValue | null;
        quantity: number;
        totalAmount: number;
        providerAmount: number;
        commissionAmount: number;
    }>;
    getOrderStats(userId: number, role: string): Promise<{
        total: number;
        pending: number;
        accepted: number;
        inProgress: number;
        completed: number;
        cancelled: number;
        totalRevenue: number;
        completionRate: number;
    }>;
    getOrderHistory(userId: number, role: string, page?: number, limit?: number): Promise<{
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
                id: number;
                description: string;
                image: string;
                title: string;
                commission: number;
                whatsapp: string;
                categoryId: number | null;
            };
            invoice: {
                id: number;
                totalAmount: number;
                isVerified: boolean;
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
            id: number;
            bookingId: string;
            userId: number;
            providerId: number;
            serviceId: number;
            status: string;
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
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
    }>;
    getOrderAnalytics(userId: number, role: string, startDate?: Date, endDate?: Date): Promise<{
        monthlyData: any[];
        serviceAnalytics: any[];
        statusAnalytics: any[];
        totalOrders: number;
        totalRevenue: number;
        averageOrderValue: number;
    }>;
    bulkUpdateStatus(orderIds: number[], status: OrderStatus, userId: number, role: string): Promise<{
        message: string;
    }>;
    getOrdersByDateRange(userId: number, role: string, startDate: Date, endDate: Date): Promise<({
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
            id: number;
            description: string;
            image: string;
            title: string;
            commission: number;
            whatsapp: string;
            categoryId: number | null;
        };
        invoice: {
            id: number;
            totalAmount: number;
            isVerified: boolean;
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
        id: number;
        bookingId: string;
        userId: number;
        providerId: number;
        serviceId: number;
        status: string;
        orderDate: Date;
        scheduledDate: Date | null;
        location: string | null;
        locationDetails: string | null;
        providerLocation: import("generated/prisma/runtime/library").JsonValue | null;
        quantity: number;
        totalAmount: number;
        providerAmount: number;
        commissionAmount: number;
    })[]>;
    getOrdersByStatus(userId: number, role: string, status: OrderStatus): Promise<({
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
            id: number;
            description: string;
            image: string;
            title: string;
            commission: number;
            whatsapp: string;
            categoryId: number | null;
        };
        invoice: {
            id: number;
            totalAmount: number;
            isVerified: boolean;
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
        id: number;
        bookingId: string;
        userId: number;
        providerId: number;
        serviceId: number;
        status: string;
        orderDate: Date;
        scheduledDate: Date | null;
        location: string | null;
        locationDetails: string | null;
        providerLocation: import("generated/prisma/runtime/library").JsonValue | null;
        quantity: number;
        totalAmount: number;
        providerAmount: number;
        commissionAmount: number;
    })[]>;
    getUpcomingOrders(userId: number, role: string): Promise<({
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
            id: number;
            description: string;
            image: string;
            title: string;
            commission: number;
            whatsapp: string;
            categoryId: number | null;
        };
        invoice: {
            id: number;
            totalAmount: number;
            isVerified: boolean;
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
        id: number;
        bookingId: string;
        userId: number;
        providerId: number;
        serviceId: number;
        status: string;
        orderDate: Date;
        scheduledDate: Date | null;
        location: string | null;
        locationDetails: string | null;
        providerLocation: import("generated/prisma/runtime/library").JsonValue | null;
        quantity: number;
        totalAmount: number;
        providerAmount: number;
        commissionAmount: number;
    })[]>;
    getOverdueOrders(userId: number, role: string): Promise<({
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
            id: number;
            description: string;
            image: string;
            title: string;
            commission: number;
            whatsapp: string;
            categoryId: number | null;
        };
        invoice: {
            id: number;
            totalAmount: number;
            isVerified: boolean;
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
        id: number;
        bookingId: string;
        userId: number;
        providerId: number;
        serviceId: number;
        status: string;
        orderDate: Date;
        scheduledDate: Date | null;
        location: string | null;
        locationDetails: string | null;
        providerLocation: import("generated/prisma/runtime/library").JsonValue | null;
        quantity: number;
        totalAmount: number;
        providerAmount: number;
        commissionAmount: number;
    })[]>;
    private calculateMonthlyAnalytics;
    private calculateServiceAnalytics;
    private calculateStatusAnalytics;
    private getValidStatusTransitions;
}

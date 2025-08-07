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
        service: {
            description: string;
            id: number;
            image: string;
            title: string;
            commission: number;
            whatsapp: string;
            categoryId: number | null;
        };
        provider: {
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
        };
        user: {
            id: number;
            name: string;
            email: string;
            password: string;
            image: string;
            state: string;
            phone: string;
            isActive: boolean;
            officialDocuments: string | null;
            createdAt: Date;
            updatedAt: Date;
            address: string;
            role: string;
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
    }>;
    findAll(userId: number, role: string): Promise<({
        service: {
            description: string;
            id: number;
            image: string;
            title: string;
        };
        provider: {
            id: number;
            name: string;
            image: string;
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
    })[]>;
    findOne(id: number, userId: number, role: string): Promise<{
        service: {
            description: string;
            id: number;
            image: string;
            title: string;
            commission: number;
        };
        provider: {
            description: string;
            id: number;
            name: string;
            image: string;
            phone: string;
        };
        user: {
            id: number;
            name: string;
            email: string;
            phone: string;
            address: string;
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
    }>;
    updateStatus(id: number, updateStatusDto: UpdateOrderStatusDto, userId: number, role: string): Promise<{
        service: {
            description: string;
            id: number;
            image: string;
            title: string;
        };
        provider: {
            id: number;
            name: string;
            image: string;
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
    }>;
    cancel(id: number, userId: number, role: string): Promise<{
        service: {
            description: string;
            id: number;
            image: string;
            title: string;
        };
        provider: {
            id: number;
            name: string;
            image: string;
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
            service: {
                description: string;
                id: number;
                image: string;
                title: string;
                commission: number;
                whatsapp: string;
                categoryId: number | null;
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
        service: {
            description: string;
            id: number;
            image: string;
            title: string;
            commission: number;
            whatsapp: string;
            categoryId: number | null;
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
    })[]>;
    getOrdersByStatus(userId: number, role: string, status: OrderStatus): Promise<({
        service: {
            description: string;
            id: number;
            image: string;
            title: string;
            commission: number;
            whatsapp: string;
            categoryId: number | null;
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
    })[]>;
    getUpcomingOrders(userId: number, role: string): Promise<({
        service: {
            description: string;
            id: number;
            image: string;
            title: string;
            commission: number;
            whatsapp: string;
            categoryId: number | null;
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
    })[]>;
    getOverdueOrders(userId: number, role: string): Promise<({
        service: {
            description: string;
            id: number;
            image: string;
            title: string;
            commission: number;
            whatsapp: string;
            categoryId: number | null;
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
    })[]>;
    private calculateMonthlyAnalytics;
    private calculateServiceAnalytics;
    private calculateStatusAnalytics;
    private getValidStatusTransitions;
}

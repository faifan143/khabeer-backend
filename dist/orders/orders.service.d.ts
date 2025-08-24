import { PrismaService } from '../prisma/prisma.service';
import { BusinessFlowNotificationsService } from '../notifications/business-flow-notifications.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { CreateOrderMultipleServicesDto } from './dto/create-order-multiple-services.dto';
import { UpdateOrderStatusDto, OrderStatus } from './dto/order-status.dto';
export declare class OrdersService {
    private readonly prisma;
    private readonly notificationsService;
    constructor(prisma: PrismaService, notificationsService: BusinessFlowNotificationsService);
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
        };
        user: {
            id: number;
            name: string;
            image: string;
            state: string;
            phone: string;
            isActive: boolean;
            officialDocuments: string | null;
            createdAt: Date;
            email: string | null;
            updatedAt: Date;
            password: string;
            fcm: string | null;
            address: string;
            role: string;
            latitude: import("generated/prisma/runtime/library").Decimal | null;
            longitude: import("generated/prisma/runtime/library").Decimal | null;
        };
        invoice: {
            id: number;
            isVerified: boolean;
            orderId: number;
            discount: number;
            totalAmount: number;
            paymentDate: Date | null;
            paymentMethod: string | null;
            paymentStatus: string;
            payoutDate: Date | null;
            payoutStatus: string;
            verifiedAt: Date | null;
            verifiedBy: number | null;
        } | null;
        serviceId: number;
        id: number;
        location: string | null;
        providerId: number;
        status: string;
        scheduledDate: Date | null;
        locationDetails: string | null;
        quantity: number;
        providerLocation: import("generated/prisma/runtime/library").JsonValue | null;
        userId: number;
        orderDate: Date;
        bookingId: string;
        commissionAmount: number;
        providerAmount: number;
        totalAmount: number;
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
            phone: string;
            email: string | null;
            latitude: import("generated/prisma/runtime/library").Decimal | null;
            longitude: import("generated/prisma/runtime/library").Decimal | null;
        };
        invoice: {
            id: number;
            isVerified: boolean;
            orderId: number;
            discount: number;
            totalAmount: number;
            paymentDate: Date | null;
            paymentMethod: string | null;
            paymentStatus: string;
            payoutDate: Date | null;
            payoutStatus: string;
            verifiedAt: Date | null;
            verifiedBy: number | null;
        } | null;
    } & {
        serviceId: number;
        id: number;
        location: string | null;
        providerId: number;
        status: string;
        scheduledDate: Date | null;
        locationDetails: string | null;
        quantity: number;
        providerLocation: import("generated/prisma/runtime/library").JsonValue | null;
        userId: number;
        orderDate: Date;
        bookingId: string;
        commissionAmount: number;
        providerAmount: number;
        totalAmount: number;
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
            phone: string;
            email: string | null;
            address: string;
            latitude: import("generated/prisma/runtime/library").Decimal | null;
            longitude: import("generated/prisma/runtime/library").Decimal | null;
        };
        invoice: {
            id: number;
            isVerified: boolean;
            orderId: number;
            discount: number;
            totalAmount: number;
            paymentDate: Date | null;
            paymentMethod: string | null;
            paymentStatus: string;
            payoutDate: Date | null;
            payoutStatus: string;
            verifiedAt: Date | null;
            verifiedBy: number | null;
        } | null;
    } & {
        serviceId: number;
        id: number;
        location: string | null;
        providerId: number;
        status: string;
        scheduledDate: Date | null;
        locationDetails: string | null;
        quantity: number;
        providerLocation: import("generated/prisma/runtime/library").JsonValue | null;
        userId: number;
        orderDate: Date;
        bookingId: string;
        commissionAmount: number;
        providerAmount: number;
        totalAmount: number;
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
            phone: string;
            email: string | null;
            latitude: import("generated/prisma/runtime/library").Decimal | null;
            longitude: import("generated/prisma/runtime/library").Decimal | null;
        };
        invoice: {
            id: number;
            isVerified: boolean;
            orderId: number;
            discount: number;
            totalAmount: number;
            paymentDate: Date | null;
            paymentMethod: string | null;
            paymentStatus: string;
            payoutDate: Date | null;
            payoutStatus: string;
            verifiedAt: Date | null;
            verifiedBy: number | null;
        } | null;
    } & {
        serviceId: number;
        id: number;
        location: string | null;
        providerId: number;
        status: string;
        scheduledDate: Date | null;
        locationDetails: string | null;
        quantity: number;
        providerLocation: import("generated/prisma/runtime/library").JsonValue | null;
        userId: number;
        orderDate: Date;
        bookingId: string;
        commissionAmount: number;
        providerAmount: number;
        totalAmount: number;
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
            phone: string;
            email: string | null;
            latitude: import("generated/prisma/runtime/library").Decimal | null;
            longitude: import("generated/prisma/runtime/library").Decimal | null;
        };
        invoice: {
            id: number;
            isVerified: boolean;
            orderId: number;
            discount: number;
            totalAmount: number;
            paymentDate: Date | null;
            paymentMethod: string | null;
            paymentStatus: string;
            payoutDate: Date | null;
            payoutStatus: string;
            verifiedAt: Date | null;
            verifiedBy: number | null;
        } | null;
    } & {
        serviceId: number;
        id: number;
        location: string | null;
        providerId: number;
        status: string;
        scheduledDate: Date | null;
        locationDetails: string | null;
        quantity: number;
        providerLocation: import("generated/prisma/runtime/library").JsonValue | null;
        userId: number;
        orderDate: Date;
        bookingId: string;
        commissionAmount: number;
        providerAmount: number;
        totalAmount: number;
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
                phone: string;
                email: string | null;
            };
            user: {
                id: number;
                name: string;
                phone: string;
                email: string | null;
                latitude: import("generated/prisma/runtime/library").Decimal | null;
                longitude: import("generated/prisma/runtime/library").Decimal | null;
            };
            invoice: {
                id: number;
                isVerified: boolean;
                orderId: number;
                discount: number;
                totalAmount: number;
                paymentDate: Date | null;
                paymentMethod: string | null;
                paymentStatus: string;
                payoutDate: Date | null;
                payoutStatus: string;
                verifiedAt: Date | null;
                verifiedBy: number | null;
            } | null;
        } & {
            serviceId: number;
            id: number;
            location: string | null;
            providerId: number;
            status: string;
            scheduledDate: Date | null;
            locationDetails: string | null;
            quantity: number;
            providerLocation: import("generated/prisma/runtime/library").JsonValue | null;
            userId: number;
            orderDate: Date;
            bookingId: string;
            commissionAmount: number;
            providerAmount: number;
            totalAmount: number;
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
            phone: string;
            email: string | null;
        };
        user: {
            id: number;
            name: string;
            phone: string;
            email: string | null;
            latitude: import("generated/prisma/runtime/library").Decimal | null;
            longitude: import("generated/prisma/runtime/library").Decimal | null;
        };
        invoice: {
            id: number;
            isVerified: boolean;
            orderId: number;
            discount: number;
            totalAmount: number;
            paymentDate: Date | null;
            paymentMethod: string | null;
            paymentStatus: string;
            payoutDate: Date | null;
            payoutStatus: string;
            verifiedAt: Date | null;
            verifiedBy: number | null;
        } | null;
    } & {
        serviceId: number;
        id: number;
        location: string | null;
        providerId: number;
        status: string;
        scheduledDate: Date | null;
        locationDetails: string | null;
        quantity: number;
        providerLocation: import("generated/prisma/runtime/library").JsonValue | null;
        userId: number;
        orderDate: Date;
        bookingId: string;
        commissionAmount: number;
        providerAmount: number;
        totalAmount: number;
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
            phone: string;
            email: string | null;
        };
        user: {
            id: number;
            name: string;
            phone: string;
            email: string | null;
            latitude: import("generated/prisma/runtime/library").Decimal | null;
            longitude: import("generated/prisma/runtime/library").Decimal | null;
        };
        invoice: {
            id: number;
            isVerified: boolean;
            orderId: number;
            discount: number;
            totalAmount: number;
            paymentDate: Date | null;
            paymentMethod: string | null;
            paymentStatus: string;
            payoutDate: Date | null;
            payoutStatus: string;
            verifiedAt: Date | null;
            verifiedBy: number | null;
        } | null;
    } & {
        serviceId: number;
        id: number;
        location: string | null;
        providerId: number;
        status: string;
        scheduledDate: Date | null;
        locationDetails: string | null;
        quantity: number;
        providerLocation: import("generated/prisma/runtime/library").JsonValue | null;
        userId: number;
        orderDate: Date;
        bookingId: string;
        commissionAmount: number;
        providerAmount: number;
        totalAmount: number;
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
            phone: string;
            email: string | null;
        };
        user: {
            id: number;
            name: string;
            phone: string;
            email: string | null;
            latitude: import("generated/prisma/runtime/library").Decimal | null;
            longitude: import("generated/prisma/runtime/library").Decimal | null;
        };
        invoice: {
            id: number;
            isVerified: boolean;
            orderId: number;
            discount: number;
            totalAmount: number;
            paymentDate: Date | null;
            paymentMethod: string | null;
            paymentStatus: string;
            payoutDate: Date | null;
            payoutStatus: string;
            verifiedAt: Date | null;
            verifiedBy: number | null;
        } | null;
    } & {
        serviceId: number;
        id: number;
        location: string | null;
        providerId: number;
        status: string;
        scheduledDate: Date | null;
        locationDetails: string | null;
        quantity: number;
        providerLocation: import("generated/prisma/runtime/library").JsonValue | null;
        userId: number;
        orderDate: Date;
        bookingId: string;
        commissionAmount: number;
        providerAmount: number;
        totalAmount: number;
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
            phone: string;
            email: string | null;
        };
        user: {
            id: number;
            name: string;
            phone: string;
            email: string | null;
            latitude: import("generated/prisma/runtime/library").Decimal | null;
            longitude: import("generated/prisma/runtime/library").Decimal | null;
        };
        invoice: {
            id: number;
            isVerified: boolean;
            orderId: number;
            discount: number;
            totalAmount: number;
            paymentDate: Date | null;
            paymentMethod: string | null;
            paymentStatus: string;
            payoutDate: Date | null;
            payoutStatus: string;
            verifiedAt: Date | null;
            verifiedBy: number | null;
        } | null;
    } & {
        serviceId: number;
        id: number;
        location: string | null;
        providerId: number;
        status: string;
        scheduledDate: Date | null;
        locationDetails: string | null;
        quantity: number;
        providerLocation: import("generated/prisma/runtime/library").JsonValue | null;
        userId: number;
        orderDate: Date;
        bookingId: string;
        commissionAmount: number;
        providerAmount: number;
        totalAmount: number;
    })[]>;
    private calculateMonthlyAnalytics;
    private calculateServiceAnalytics;
    private calculateStatusAnalytics;
    private getValidStatusTransitions;
    createMultipleServices(createOrderDto: CreateOrderMultipleServicesDto, userId: number): Promise<{
        id: number;
        bookingId: string;
        userId: number;
        providerId: number;
        status: string;
        orderDate: Date;
        scheduledDate: Date | null;
        location: string | null;
        locationDetails: string | null;
        userLocation: {
            latitude: number;
            longitude: number;
            address?: string;
        } | undefined;
        notes: string | undefined;
        services: any[];
        subtotal: number;
        totalCommission: number;
        totalAmount: number;
        appliedOffers: any[] | undefined;
        provider: {
            id: number;
            name: string;
            phone: string;
            image: string;
        };
        user: {
            id: number;
            name: string;
            phone: string;
            email: string | null;
        };
    }>;
}

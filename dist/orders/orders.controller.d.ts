import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/order-status.dto';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    create(createOrderDto: CreateOrderDto, req: any): Promise<{
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
            fcmToken: string | null;
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
            fcmToken: string | null;
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
    findAll(req: any, status?: string): Promise<({
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
    getStats(req: any): Promise<{
        total: number;
        pending: number;
        accepted: number;
        inProgress: number;
        completed: number;
        cancelled: number;
        totalRevenue: number;
        completionRate: number;
    }>;
    getOrderHistory(req: any, page?: number, limit?: number): Promise<{
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
    getOrderAnalytics(req: any, startDate?: string, endDate?: string): Promise<{
        monthlyData: any[];
        serviceAnalytics: any[];
        statusAnalytics: any[];
        totalOrders: number;
        totalRevenue: number;
        averageOrderValue: number;
    }>;
    getOrdersByDateRange(req: any, startDate: string, endDate: string): Promise<({
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
    getOrdersByStatus(req: any, status: string): Promise<({
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
    getUpcomingOrders(req: any): Promise<({
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
    getOverdueOrders(req: any): Promise<({
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
    findOne(id: number, req: any): Promise<{
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
    updateStatus(id: number, updateStatusDto: UpdateOrderStatusDto, req: any): Promise<{
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
    acceptOrder(id: number, updateStatusDto: UpdateOrderStatusDto, req: any): Promise<{
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
    rejectOrder(id: number, updateStatusDto: UpdateOrderStatusDto, req: any): Promise<{
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
    startOrder(id: number, updateStatusDto: UpdateOrderStatusDto, req: any): Promise<{
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
    completeOrder(id: number, updateStatusDto: UpdateOrderStatusDto, req: any): Promise<{
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
    cancelOrder(id: number, req: any): Promise<{
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
    bulkUpdateStatus(req: any, body: {
        orderIds: number[];
        status: string;
    }): Promise<{
        message: string;
    }>;
}

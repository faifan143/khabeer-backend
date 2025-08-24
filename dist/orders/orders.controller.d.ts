import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { CreateOrderMultipleServicesDto } from './dto/create-order-multiple-services.dto';
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
        userId: number;
        status: string;
        scheduledDate: Date | null;
        locationDetails: string | null;
        quantity: number;
        providerLocation: import("generated/prisma/runtime/library").JsonValue | null;
        orderDate: Date;
        bookingId: string;
        commissionAmount: number;
        providerAmount: number;
        totalAmount: number;
    }>;
    createMultipleServices(createOrderDto: CreateOrderMultipleServicesDto, req: any): Promise<{
        id: number;
        bookingId: string;
        userId: number;
        providerId: number;
        status: string;
        orderDate: Date;
        scheduledDate: Date | null;
        location: string | null;
        locationDetails: string | null;
        userLocation: any;
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
        } | undefined;
        user: {
            id: number;
            name: string;
            phone: string;
            email: string | null;
        } | undefined;
    }>;
    findAll(req: any, status?: string): Promise<(({
        service: {
            category: {
                id: number;
                image: string;
                state: string;
                titleAr: string;
                titleEn: string;
            } | null;
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
            image: string;
            state: string;
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
        userId: number;
        status: string;
        scheduledDate: Date | null;
        locationDetails: string | null;
        quantity: number;
        providerLocation: import("generated/prisma/runtime/library").JsonValue | null;
        orderDate: Date;
        bookingId: string;
        commissionAmount: number;
        providerAmount: number;
        totalAmount: number;
    }) | {
        duration: Date | null;
        user: {
            image: string;
            state: string;
            latitude: number | null;
            longitude: number | null;
            id: number;
            name: string;
            phone: string;
            email: string | null;
        };
        service: {
            image: string;
            category: {
                id: number;
                image: string;
                state: string;
                titleAr: string;
                titleEn: string;
            } | undefined;
            description: string;
            id: number;
            title: string;
        };
        provider: {
            id: number;
            name: string;
            image: string;
            phone: string;
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
        userId: number;
        status: string;
        scheduledDate: Date | null;
        locationDetails: string | null;
        quantity: number;
        providerLocation: import("generated/prisma/runtime/library").JsonValue | null;
        orderDate: Date;
        bookingId: string;
        commissionAmount: number;
        providerAmount: number;
        totalAmount: number;
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
            userId: number;
            status: string;
            scheduledDate: Date | null;
            locationDetails: string | null;
            quantity: number;
            providerLocation: import("generated/prisma/runtime/library").JsonValue | null;
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
        userId: number;
        status: string;
        scheduledDate: Date | null;
        locationDetails: string | null;
        quantity: number;
        providerLocation: import("generated/prisma/runtime/library").JsonValue | null;
        orderDate: Date;
        bookingId: string;
        commissionAmount: number;
        providerAmount: number;
        totalAmount: number;
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
        userId: number;
        status: string;
        scheduledDate: Date | null;
        locationDetails: string | null;
        quantity: number;
        providerLocation: import("generated/prisma/runtime/library").JsonValue | null;
        orderDate: Date;
        bookingId: string;
        commissionAmount: number;
        providerAmount: number;
        totalAmount: number;
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
        userId: number;
        status: string;
        scheduledDate: Date | null;
        locationDetails: string | null;
        quantity: number;
        providerLocation: import("generated/prisma/runtime/library").JsonValue | null;
        orderDate: Date;
        bookingId: string;
        commissionAmount: number;
        providerAmount: number;
        totalAmount: number;
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
        userId: number;
        status: string;
        scheduledDate: Date | null;
        locationDetails: string | null;
        quantity: number;
        providerLocation: import("generated/prisma/runtime/library").JsonValue | null;
        orderDate: Date;
        bookingId: string;
        commissionAmount: number;
        providerAmount: number;
        totalAmount: number;
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
        userId: number;
        status: string;
        scheduledDate: Date | null;
        locationDetails: string | null;
        quantity: number;
        providerLocation: import("generated/prisma/runtime/library").JsonValue | null;
        orderDate: Date;
        bookingId: string;
        commissionAmount: number;
        providerAmount: number;
        totalAmount: number;
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
        userId: number;
        status: string;
        scheduledDate: Date | null;
        locationDetails: string | null;
        quantity: number;
        providerLocation: import("generated/prisma/runtime/library").JsonValue | null;
        orderDate: Date;
        bookingId: string;
        commissionAmount: number;
        providerAmount: number;
        totalAmount: number;
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
        userId: number;
        status: string;
        scheduledDate: Date | null;
        locationDetails: string | null;
        quantity: number;
        providerLocation: import("generated/prisma/runtime/library").JsonValue | null;
        orderDate: Date;
        bookingId: string;
        commissionAmount: number;
        providerAmount: number;
        totalAmount: number;
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
        userId: number;
        status: string;
        scheduledDate: Date | null;
        locationDetails: string | null;
        quantity: number;
        providerLocation: import("generated/prisma/runtime/library").JsonValue | null;
        orderDate: Date;
        bookingId: string;
        commissionAmount: number;
        providerAmount: number;
        totalAmount: number;
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
        userId: number;
        status: string;
        scheduledDate: Date | null;
        locationDetails: string | null;
        quantity: number;
        providerLocation: import("generated/prisma/runtime/library").JsonValue | null;
        orderDate: Date;
        bookingId: string;
        commissionAmount: number;
        providerAmount: number;
        totalAmount: number;
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
        userId: number;
        status: string;
        scheduledDate: Date | null;
        locationDetails: string | null;
        quantity: number;
        providerLocation: import("generated/prisma/runtime/library").JsonValue | null;
        orderDate: Date;
        bookingId: string;
        commissionAmount: number;
        providerAmount: number;
        totalAmount: number;
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
        userId: number;
        status: string;
        scheduledDate: Date | null;
        locationDetails: string | null;
        quantity: number;
        providerLocation: import("generated/prisma/runtime/library").JsonValue | null;
        orderDate: Date;
        bookingId: string;
        commissionAmount: number;
        providerAmount: number;
        totalAmount: number;
    }>;
    bulkUpdateStatus(req: any, body: {
        orderIds: number[];
        status: string;
    }): Promise<{
        message: string;
    }>;
}

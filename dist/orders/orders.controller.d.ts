import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/order-status.dto';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    create(createOrderDto: CreateOrderDto, req: any): Promise<{
        service: {
            image: string;
            id: number;
            description: string;
            title: string;
            commission: number;
            whatsapp: string;
            categoryId: number | null;
        };
        provider: {
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
        };
        user: {
            name: string;
            email: string;
            password: string;
            image: string;
            address: string;
            phone: string;
            state: string;
            role: string;
            isActive: boolean;
            officialDocuments: string | null;
            id: number;
            createdAt: Date;
            updatedAt: Date;
        };
        invoice: {
            id: number;
            totalAmount: number;
            orderId: number;
            paymentDate: Date | null;
            discount: number;
            paymentStatus: string;
            paymentMethod: string | null;
        } | null;
    } & {
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
    }>;
    findAll(req: any, status?: string): Promise<({
        service: {
            image: string;
            id: number;
            description: string;
            title: string;
        };
        provider: {
            name: string;
            image: string;
            phone: string;
            id: number;
        };
        user: {
            name: string;
            email: string;
            phone: string;
            id: number;
        };
        invoice: {
            id: number;
            totalAmount: number;
            orderId: number;
            paymentDate: Date | null;
            discount: number;
            paymentStatus: string;
            paymentMethod: string | null;
        } | null;
    } & {
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
    })[]>;
    getStats(req: any): Promise<{
        total: number;
        pending: number;
        completed: number;
        cancelled: number;
        active: number;
    }>;
    findOne(id: number, req: any): Promise<{
        service: {
            image: string;
            id: number;
            description: string;
            title: string;
            commission: number;
        };
        provider: {
            name: string;
            image: string;
            phone: string;
            id: number;
            description: string;
        };
        user: {
            name: string;
            email: string;
            address: string;
            phone: string;
            id: number;
        };
        invoice: {
            id: number;
            totalAmount: number;
            orderId: number;
            paymentDate: Date | null;
            discount: number;
            paymentStatus: string;
            paymentMethod: string | null;
        } | null;
    } & {
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
    }>;
    updateStatus(id: number, updateStatusDto: UpdateOrderStatusDto, req: any): Promise<{
        service: {
            image: string;
            id: number;
            description: string;
            title: string;
        };
        provider: {
            name: string;
            image: string;
            phone: string;
            id: number;
        };
        user: {
            name: string;
            email: string;
            phone: string;
            id: number;
        };
        invoice: {
            id: number;
            totalAmount: number;
            orderId: number;
            paymentDate: Date | null;
            discount: number;
            paymentStatus: string;
            paymentMethod: string | null;
        } | null;
    } & {
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
    }>;
    acceptOrder(id: number, updateStatusDto: UpdateOrderStatusDto, req: any): Promise<{
        service: {
            image: string;
            id: number;
            description: string;
            title: string;
        };
        provider: {
            name: string;
            image: string;
            phone: string;
            id: number;
        };
        user: {
            name: string;
            email: string;
            phone: string;
            id: number;
        };
        invoice: {
            id: number;
            totalAmount: number;
            orderId: number;
            paymentDate: Date | null;
            discount: number;
            paymentStatus: string;
            paymentMethod: string | null;
        } | null;
    } & {
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
    }>;
    rejectOrder(id: number, updateStatusDto: UpdateOrderStatusDto, req: any): Promise<{
        service: {
            image: string;
            id: number;
            description: string;
            title: string;
        };
        provider: {
            name: string;
            image: string;
            phone: string;
            id: number;
        };
        user: {
            name: string;
            email: string;
            phone: string;
            id: number;
        };
        invoice: {
            id: number;
            totalAmount: number;
            orderId: number;
            paymentDate: Date | null;
            discount: number;
            paymentStatus: string;
            paymentMethod: string | null;
        } | null;
    } & {
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
    }>;
    startOrder(id: number, updateStatusDto: UpdateOrderStatusDto, req: any): Promise<{
        service: {
            image: string;
            id: number;
            description: string;
            title: string;
        };
        provider: {
            name: string;
            image: string;
            phone: string;
            id: number;
        };
        user: {
            name: string;
            email: string;
            phone: string;
            id: number;
        };
        invoice: {
            id: number;
            totalAmount: number;
            orderId: number;
            paymentDate: Date | null;
            discount: number;
            paymentStatus: string;
            paymentMethod: string | null;
        } | null;
    } & {
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
    }>;
    completeOrder(id: number, updateStatusDto: UpdateOrderStatusDto, req: any): Promise<{
        service: {
            image: string;
            id: number;
            description: string;
            title: string;
        };
        provider: {
            name: string;
            image: string;
            phone: string;
            id: number;
        };
        user: {
            name: string;
            email: string;
            phone: string;
            id: number;
        };
        invoice: {
            id: number;
            totalAmount: number;
            orderId: number;
            paymentDate: Date | null;
            discount: number;
            paymentStatus: string;
            paymentMethod: string | null;
        } | null;
    } & {
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
    }>;
    cancelOrder(id: number, req: any): Promise<{
        service: {
            image: string;
            id: number;
            description: string;
            title: string;
        };
        provider: {
            name: string;
            image: string;
            phone: string;
            id: number;
        };
        user: {
            name: string;
            email: string;
            phone: string;
            id: number;
        };
        invoice: {
            id: number;
            totalAmount: number;
            orderId: number;
            paymentDate: Date | null;
            discount: number;
            paymentStatus: string;
            paymentMethod: string | null;
        } | null;
    } & {
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
    }>;
}

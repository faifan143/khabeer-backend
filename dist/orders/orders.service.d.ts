import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/order-status.dto';
export declare class OrdersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(createOrderDto: CreateOrderDto, userId: number): Promise<{
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
    findAll(userId: number, role: string): Promise<({
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
    findOne(id: number, userId: number, role: string): Promise<{
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
    updateStatus(id: number, updateStatusDto: UpdateOrderStatusDto, userId: number, role: string): Promise<{
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
    cancel(id: number, userId: number, role: string): Promise<{
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
    getOrderStats(userId: number, role: string): Promise<{
        total: number;
        pending: number;
        completed: number;
        cancelled: number;
        active: number;
    }>;
    private getValidStatusTransitions;
}

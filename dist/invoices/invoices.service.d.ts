import { PrismaService } from '../prisma/prisma.service';
export interface CreateInvoiceDto {
    orderId: number;
    totalAmount: number;
    discount?: number;
    paymentMethod?: string;
}
export interface UpdatePaymentStatusDto {
    paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
    paymentMethod?: string;
    paymentDate?: Date;
}
export declare class InvoicesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(createInvoiceDto: CreateInvoiceDto): Promise<{
        order: {
            service: {
                id: number;
                description: string;
                title: string;
            };
            provider: {
                name: string;
                phone: string;
                id: number;
            };
            user: {
                name: string;
                email: string;
                phone: string;
                id: number;
            };
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
        };
    } & {
        id: number;
        totalAmount: number;
        orderId: number;
        paymentDate: Date | null;
        discount: number;
        paymentStatus: string;
        paymentMethod: string | null;
    }>;
    findAll(userId: number, role: string): Promise<({
        order: {
            service: {
                id: number;
                description: string;
                title: string;
            };
            provider: {
                name: string;
                phone: string;
                id: number;
            };
            user: {
                name: string;
                email: string;
                phone: string;
                id: number;
            };
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
        };
    } & {
        id: number;
        totalAmount: number;
        orderId: number;
        paymentDate: Date | null;
        discount: number;
        paymentStatus: string;
        paymentMethod: string | null;
    })[]>;
    findOne(id: number, userId: number, role: string): Promise<{
        order: {
            service: {
                id: number;
                description: string;
                title: string;
                commission: number;
            };
            provider: {
                name: string;
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
        };
    } & {
        id: number;
        totalAmount: number;
        orderId: number;
        paymentDate: Date | null;
        discount: number;
        paymentStatus: string;
        paymentMethod: string | null;
    }>;
    updatePaymentStatus(id: number, updatePaymentStatusDto: UpdatePaymentStatusDto, userId: number, role: string): Promise<{
        order: {
            service: {
                id: number;
                description: string;
                title: string;
            };
            provider: {
                name: string;
                phone: string;
                id: number;
            };
            user: {
                name: string;
                email: string;
                phone: string;
                id: number;
            };
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
        };
    } & {
        id: number;
        totalAmount: number;
        orderId: number;
        paymentDate: Date | null;
        discount: number;
        paymentStatus: string;
        paymentMethod: string | null;
    }>;
    getPaymentStats(userId: number, role: string): Promise<{
        total: number;
        paid: number;
        pending: number;
        failed: number;
        refunded: number;
        totalAmount: number;
        totalDiscount: number;
        paidAmount: number;
        netAmount: number;
    }>;
    generateInvoiceReport(userId: number, role: string, startDate?: Date, endDate?: Date): Promise<{
        invoiceId: number;
        orderId: number;
        serviceTitle: string;
        totalAmount: number;
        discount: number;
        netAmount: number;
        commission: number;
        paymentStatus: string;
        paymentDate: Date | null;
        orderDate: Date;
    }[]>;
}

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
                description: string;
                id: number;
                title: string;
            };
            provider: {
                id: number;
                name: string;
                phone: string;
            };
            user: {
                id: number;
                name: string;
                email: string;
                phone: string;
            };
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
        };
    } & {
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
    }>;
    findAll(userId: number, role: string): Promise<({
        order: {
            service: {
                description: string;
                id: number;
                title: string;
            };
            provider: {
                id: number;
                name: string;
                phone: string;
            };
            user: {
                id: number;
                name: string;
                email: string;
                phone: string;
            };
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
        };
    } & {
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
    })[]>;
    findOne(id: number, userId: number, role: string): Promise<{
        order: {
            service: {
                description: string;
                id: number;
                title: string;
                commission: number;
            };
            provider: {
                description: string;
                id: number;
                name: string;
                phone: string;
            };
            user: {
                id: number;
                name: string;
                email: string;
                phone: string;
                address: string;
            };
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
        };
    } & {
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
    }>;
    updatePaymentStatus(id: number, updatePaymentStatusDto: UpdatePaymentStatusDto, userId: number, role: string): Promise<{
        order: {
            service: {
                description: string;
                id: number;
                title: string;
            };
            provider: {
                id: number;
                name: string;
                phone: string;
            };
            user: {
                id: number;
                name: string;
                email: string;
                phone: string;
            };
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
        };
    } & {
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
    confirmPayment(invoiceId: number, providerId: number): Promise<{
        order: {
            provider: {
                id: number;
                name: string;
                email: string | null;
            };
            user: {
                id: number;
                name: string;
                email: string;
            };
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
        };
    } & {
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
    }>;
    getProviderPendingConfirmations(providerId: number): Promise<({
        order: {
            service: {
                title: string;
            };
            user: {
                id: number;
                name: string;
                email: string;
            };
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
        };
    } & {
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
    })[]>;
}

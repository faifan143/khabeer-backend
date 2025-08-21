import { InvoicesService, CreateInvoiceDto, UpdatePaymentStatusDto } from './invoices.service';
export declare class InvoicesController {
    private readonly invoicesService;
    constructor(invoicesService: InvoicesService);
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
                phone: string;
                email: string | null;
            };
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
        };
    } & {
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
    }>;
    findAll(req: any, status?: string): Promise<({
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
                phone: string;
                email: string | null;
            };
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
        };
    } & {
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
    })[]>;
    getStats(req: any): Promise<{
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
    generateReport(req: any, startDate?: string, endDate?: string): Promise<{
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
    getPendingConfirmations(req: any): Promise<({
        order: {
            service: {
                title: string;
            };
            user: {
                id: number;
                name: string;
                email: string | null;
            };
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
        };
    } & {
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
    })[]>;
    findOne(id: number, req: any): Promise<{
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
                phone: string;
                email: string | null;
                address: string;
            };
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
        };
    } & {
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
    }>;
    updatePaymentStatus(id: number, updatePaymentStatusDto: UpdatePaymentStatusDto, req: any): Promise<{
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
                phone: string;
                email: string | null;
            };
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
        };
    } & {
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
    }>;
    markAsPaid(id: number, body: {
        paymentMethod?: string;
    }, req: any): Promise<{
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
                phone: string;
                email: string | null;
            };
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
        };
    } & {
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
    }>;
    markAsFailed(id: number, req: any): Promise<{
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
                phone: string;
                email: string | null;
            };
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
        };
    } & {
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
    }>;
    refund(id: number, req: any): Promise<{
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
                phone: string;
                email: string | null;
            };
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
        };
    } & {
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
    }>;
    confirmPayment(id: number, req: any): Promise<{
        order: {
            provider: {
                id: number;
                name: string;
                email: string | null;
            };
            user: {
                id: number;
                name: string;
                email: string | null;
            };
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
        };
    } & {
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
    }>;
}

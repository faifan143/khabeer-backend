import { InvoicesService, CreateInvoiceDto, UpdatePaymentStatusDto } from './invoices.service';
export declare class InvoicesController {
    private readonly invoicesService;
    constructor(invoicesService: InvoicesService);
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
    findAll(req: any, status?: string): Promise<({
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
    findOne(id: number, req: any): Promise<{
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
    updatePaymentStatus(id: number, updatePaymentStatusDto: UpdatePaymentStatusDto, req: any): Promise<{
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
    markAsPaid(id: number, body: {
        paymentMethod?: string;
    }, req: any): Promise<{
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
    markAsFailed(id: number, req: any): Promise<{
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
    refund(id: number, req: any): Promise<{
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
}

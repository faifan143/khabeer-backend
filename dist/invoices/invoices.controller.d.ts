import { InvoicesService, CreateInvoiceDto, UpdatePaymentStatusDto } from './invoices.service';
export declare class InvoicesController {
    private readonly invoicesService;
    constructor(invoicesService: InvoicesService);
    create(createInvoiceDto: CreateInvoiceDto): Promise<{
        commissionAmount: number;
        providerAmount: number;
        quantity: number;
        discount: number;
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
            quantity: number;
            commissionAmount: number;
            providerAmount: number;
        };
        id: number;
        orderId: number;
        totalAmount: number;
        paymentDate: Date | null;
        paymentMethod: string | null;
        paymentStatus: string;
        payoutDate: Date | null;
        payoutStatus: string;
    }>;
    findAll(req: any, status?: string): Promise<{
        commissionAmount: number;
        providerAmount: number;
        quantity: number;
        discount: number;
        order: {
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
                image: string;
                state: string;
                phone: string;
                email: string | null;
                address: string;
                latitude: import("generated/prisma/runtime/library").Decimal | null;
                longitude: import("generated/prisma/runtime/library").Decimal | null;
            };
            scheduledDate: Date | null;
            quantity: number;
            orderDate: Date;
            commissionAmount: number;
            providerAmount: number;
        };
        id: number;
        orderId: number;
        totalAmount: number;
        paymentDate: Date | null;
        paymentMethod: string | null;
        paymentStatus: string;
        payoutDate: Date | null;
        payoutStatus: string;
    }[]>;
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
        commissionAmount: number;
        providerAmount: number;
        quantity: number;
        paymentStatus: string;
        paymentDate: Date | null;
        orderDate: Date;
    }[]>;
    getUnpaidInvoices(req: any): Promise<{
        commissionAmount: number;
        providerAmount: number;
        quantity: number;
        discount: number;
        order: {
            service: {
                description: string;
                id: number;
                title: string;
            };
            user: {
                id: number;
                name: string;
                phone: string;
                email: string | null;
            };
            quantity: number;
            commissionAmount: number;
            providerAmount: number;
        };
        id: number;
        orderId: number;
        totalAmount: number;
        paymentDate: Date | null;
        paymentMethod: string | null;
        paymentStatus: string;
        payoutDate: Date | null;
        payoutStatus: string;
    }[]>;
    findOne(id: number, req: any): Promise<{
        commissionAmount: number;
        providerAmount: number;
        quantity: number;
        discount: number;
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
            quantity: number;
            commissionAmount: number;
            providerAmount: number;
        };
        id: number;
        orderId: number;
        totalAmount: number;
        paymentDate: Date | null;
        paymentMethod: string | null;
        paymentStatus: string;
        payoutDate: Date | null;
        payoutStatus: string;
    }>;
    updatePaymentStatus(id: number, updatePaymentStatusDto: UpdatePaymentStatusDto, req: any): Promise<{
        commissionAmount: number;
        providerAmount: number;
        quantity: number;
        discount: number;
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
            quantity: number;
            commissionAmount: number;
            providerAmount: number;
        };
        id: number;
        orderId: number;
        totalAmount: number;
        paymentDate: Date | null;
        paymentMethod: string | null;
        paymentStatus: string;
        payoutDate: Date | null;
        payoutStatus: string;
    }>;
    markAsPaid(id: number, body: {
        paymentMethod?: string;
    }, req: any): Promise<{
        commissionAmount: number;
        providerAmount: number;
        quantity: number;
        discount: number;
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
            quantity: number;
            commissionAmount: number;
            providerAmount: number;
        };
        id: number;
        orderId: number;
        totalAmount: number;
        paymentDate: Date | null;
        paymentMethod: string | null;
        paymentStatus: string;
        payoutDate: Date | null;
        payoutStatus: string;
    }>;
    markAsFailed(id: number, req: any): Promise<{
        commissionAmount: number;
        providerAmount: number;
        quantity: number;
        discount: number;
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
            quantity: number;
            commissionAmount: number;
            providerAmount: number;
        };
        id: number;
        orderId: number;
        totalAmount: number;
        paymentDate: Date | null;
        paymentMethod: string | null;
        paymentStatus: string;
        payoutDate: Date | null;
        payoutStatus: string;
    }>;
    refund(id: number, req: any): Promise<{
        commissionAmount: number;
        providerAmount: number;
        quantity: number;
        discount: number;
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
            quantity: number;
            commissionAmount: number;
            providerAmount: number;
        };
        id: number;
        orderId: number;
        totalAmount: number;
        paymentDate: Date | null;
        paymentMethod: string | null;
        paymentStatus: string;
        payoutDate: Date | null;
        payoutStatus: string;
    }>;
}

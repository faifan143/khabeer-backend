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
    findAll(userId: number, role: string, status?: string): Promise<{
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
    findOne(id: number, userId: number, role: string): Promise<{
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
    updatePaymentStatus(id: number, updatePaymentStatusDto: UpdatePaymentStatusDto, userId: number, role: string): Promise<{
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
        commissionAmount: number;
        providerAmount: number;
        quantity: number;
        paymentStatus: string;
        paymentDate: Date | null;
        orderDate: Date;
    }[]>;
    getProviderUnpaidInvoices(providerId: number): Promise<{
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
}

"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoicesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let InvoicesService = class InvoicesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createInvoiceDto) {
        const existingInvoice = await this.prisma.invoice.findUnique({
            where: { orderId: createInvoiceDto.orderId }
        });
        if (existingInvoice) {
            throw new common_1.BadRequestException('Invoice already exists for this order');
        }
        const order = await this.prisma.order.findUnique({
            where: { id: createInvoiceDto.orderId }
        });
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        const newInvoice = await this.prisma.invoice.create({
            data: {
                orderId: createInvoiceDto.orderId,
                totalAmount: createInvoiceDto.totalAmount,
                discount: createInvoiceDto.discount || 0,
                paymentStatus: 'pending',
                paymentMethod: createInvoiceDto.paymentMethod
            },
            include: {
                order: {
                    select: {
                        commissionAmount: true,
                        providerAmount: true,
                        quantity: true,
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                phone: true
                            }
                        },
                        provider: {
                            select: {
                                id: true,
                                name: true,
                                phone: true
                            }
                        },
                        service: {
                            select: {
                                id: true,
                                title: true,
                                description: true
                            }
                        }
                    }
                }
            }
        });
        return {
            ...newInvoice,
            commissionAmount: newInvoice.order.commissionAmount,
            providerAmount: newInvoice.order.providerAmount,
            quantity: newInvoice.order.quantity,
            discount: newInvoice.discount || 0
        };
    }
    async findAll(userId, role, status) {
        const where = role === 'PROVIDER'
            ? { order: { providerId: userId } }
            : { order: { userId } };
        if (status) {
            where.paymentStatus = status;
        }
        const invoices = await this.prisma.invoice.findMany({
            where,
            include: {
                order: {
                    select: {
                        scheduledDate: true,
                        orderDate: true,
                        commissionAmount: true,
                        providerAmount: true,
                        quantity: true,
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                phone: true,
                                state: true,
                                image: true,
                                latitude: true,
                                longitude: true,
                                address: true,
                            }
                        },
                        provider: {
                            select: {
                                id: true,
                                name: true,
                                phone: true
                            }
                        },
                        service: {
                            select: {
                                id: true,
                                title: true,
                                description: true,
                                category: true,
                            }
                        }
                    }
                }
            },
            orderBy: {
                order: {
                    orderDate: 'desc'
                }
            }
        });
        return invoices.map(invoice => ({
            ...invoice,
            commissionAmount: invoice.order.commissionAmount,
            providerAmount: invoice.order.providerAmount,
            quantity: invoice.order.quantity,
            discount: invoice.discount || 0
        }));
    }
    async findOne(id, userId, role) {
        const where = role === 'PROVIDER'
            ? { id, order: { providerId: userId } }
            : { id, order: { userId } };
        const foundInvoice = await this.prisma.invoice.findFirst({
            where,
            include: {
                order: {
                    select: {
                        commissionAmount: true,
                        providerAmount: true,
                        quantity: true,
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                phone: true,
                                address: true
                            }
                        },
                        provider: {
                            select: {
                                id: true,
                                name: true,
                                phone: true,
                                description: true
                            }
                        },
                        service: {
                            select: {
                                id: true,
                                title: true,
                                description: true,
                                commission: true
                            }
                        }
                    }
                }
            }
        });
        if (!foundInvoice) {
            throw new common_1.NotFoundException('Invoice not found');
        }
        return {
            ...foundInvoice,
            commissionAmount: foundInvoice.order.commissionAmount,
            providerAmount: foundInvoice.order.providerAmount,
            quantity: foundInvoice.order.quantity,
            discount: foundInvoice.discount || 0
        };
    }
    async updatePaymentStatus(id, updatePaymentStatusDto, userId, role) {
        const existingInvoice = await this.prisma.invoice.findUnique({
            where: { id },
            include: { order: true }
        });
        if (!existingInvoice) {
            throw new common_1.NotFoundException('Invoice not found');
        }
        if (role === 'PROVIDER' && existingInvoice.order.providerId !== userId) {
            throw new common_1.BadRequestException('You can only update invoices for your own orders');
        }
        if (role === 'USER' && existingInvoice.order.userId !== userId) {
            throw new common_1.BadRequestException('You can only update invoices for your own orders');
        }
        const updateData = {
            paymentStatus: updatePaymentStatusDto.paymentStatus
        };
        if (updatePaymentStatusDto.paymentMethod) {
            updateData.paymentMethod = updatePaymentStatusDto.paymentMethod;
        }
        if (updatePaymentStatusDto.paymentDate) {
            updateData.paymentDate = updatePaymentStatusDto.paymentDate;
        }
        else if (updatePaymentStatusDto.paymentStatus === 'paid') {
            updateData.paymentDate = new Date();
        }
        const updatedInvoice = await this.prisma.invoice.update({
            where: { id },
            data: updateData,
            include: {
                order: {
                    select: {
                        commissionAmount: true,
                        providerAmount: true,
                        quantity: true,
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                phone: true
                            }
                        },
                        provider: {
                            select: {
                                id: true,
                                name: true,
                                phone: true
                            }
                        },
                        service: {
                            select: {
                                id: true,
                                title: true,
                                description: true
                            }
                        }
                    }
                }
            }
        });
        return {
            ...updatedInvoice,
            commissionAmount: updatedInvoice.order.commissionAmount,
            providerAmount: updatedInvoice.order.providerAmount,
            quantity: updatedInvoice.order.quantity,
            discount: updatedInvoice.discount || 0
        };
    }
    async getPaymentStats(userId, role) {
        const where = role === 'PROVIDER'
            ? { order: { providerId: userId } }
            : { order: { userId } };
        const [total, paid, pending, failed, refunded] = await Promise.all([
            this.prisma.invoice.count({ where }),
            this.prisma.invoice.count({ where: { ...where, paymentStatus: 'paid' } }),
            this.prisma.invoice.count({ where: { ...where, paymentStatus: 'pending' } }),
            this.prisma.invoice.count({ where: { ...where, paymentStatus: 'failed' } }),
            this.prisma.invoice.count({ where: { ...where, paymentStatus: 'refunded' } })
        ]);
        const invoices = await this.prisma.invoice.findMany({
            where,
            select: {
                totalAmount: true,
                discount: true,
                paymentStatus: true
            }
        });
        const totalAmount = invoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
        const totalDiscount = invoices.reduce((sum, invoice) => sum + invoice.discount, 0);
        const paidAmount = invoices
            .filter(invoice => invoice.paymentStatus === 'paid')
            .reduce((sum, invoice) => sum + invoice.totalAmount, 0);
        return {
            total,
            paid,
            pending,
            failed,
            refunded,
            totalAmount,
            totalDiscount,
            paidAmount,
            netAmount: totalAmount - totalDiscount
        };
    }
    async generateInvoiceReport(userId, role, startDate, endDate) {
        const where = role === 'PROVIDER'
            ? { order: { providerId: userId } }
            : { order: { userId } };
        if (startDate || endDate) {
            where.order = {
                ...where.order,
                orderDate: {}
            };
            if (startDate) {
                where.order.orderDate.gte = startDate;
            }
            if (endDate) {
                where.order.orderDate.lte = endDate;
            }
        }
        const invoices = await this.prisma.invoice.findMany({
            where,
            include: {
                order: {
                    select: {
                        id: true,
                        orderDate: true,
                        commissionAmount: true,
                        providerAmount: true,
                        quantity: true,
                        service: {
                            select: {
                                title: true,
                                commission: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                order: {
                    orderDate: 'desc'
                }
            }
        });
        return invoices.map(invoice => ({
            invoiceId: invoice.id,
            orderId: invoice.order.id,
            serviceTitle: invoice.order.service.title,
            totalAmount: invoice.totalAmount,
            discount: invoice.discount,
            netAmount: invoice.totalAmount - invoice.discount,
            commission: invoice.order.service.commission,
            commissionAmount: invoice.order.commissionAmount,
            providerAmount: invoice.order.providerAmount,
            quantity: invoice.order.quantity,
            paymentStatus: invoice.paymentStatus,
            paymentDate: invoice.paymentDate,
            orderDate: invoice.order.orderDate
        }));
    }
    async getProviderUnpaidInvoices(providerId) {
        const invoices = await this.prisma.invoice.findMany({
            where: {
                paymentStatus: 'unpaid',
                order: {
                    providerId: providerId
                }
            },
            include: {
                order: {
                    select: {
                        commissionAmount: true,
                        providerAmount: true,
                        quantity: true,
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                phone: true
                            }
                        },
                        service: {
                            select: {
                                id: true,
                                title: true,
                                description: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                order: {
                    orderDate: 'desc'
                }
            }
        });
        return invoices.map(invoice => ({
            ...invoice,
            commissionAmount: invoice.order.commissionAmount,
            providerAmount: invoice.order.providerAmount,
            quantity: invoice.order.quantity,
            discount: invoice.discount || 0
        }));
    }
};
exports.InvoicesService = InvoicesService;
exports.InvoicesService = InvoicesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], InvoicesService);
//# sourceMappingURL=invoices.service.js.map
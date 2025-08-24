import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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

@Injectable()
export class InvoicesService {
  constructor(private readonly prisma: PrismaService) { }

  async create(createInvoiceDto: CreateInvoiceDto) {
    // Check if order exists and doesn't already have an invoice
    const existingInvoice = await this.prisma.invoice.findUnique({
      where: { orderId: createInvoiceDto.orderId }
    });

    if (existingInvoice) {
      throw new BadRequestException('Invoice already exists for this order');
    }

    const order = await this.prisma.order.findUnique({
      where: { id: createInvoiceDto.orderId }
    });

    if (!order) {
      throw new NotFoundException('Order not found');
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

    // Transform the response to include the required fields
    return {
      ...newInvoice,
      commissionAmount: newInvoice.order.commissionAmount,
      providerAmount: newInvoice.order.providerAmount,
      quantity: newInvoice.order.quantity,
      discount: newInvoice.discount || 0
    };
  }

  async findAll(userId: number, role: string, status?: string) {
    const where: any = role === 'PROVIDER'
      ? { order: { providerId: userId } }
      : { order: { userId } };

    // Add status filter if provided
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

    // Transform the response to include the required fields
    return invoices.map(invoice => ({
      ...invoice,
      commissionAmount: invoice.order.commissionAmount,
      providerAmount: invoice.order.providerAmount,
      quantity: invoice.order.quantity,
      discount: invoice.discount || 0
    }));
  }

  async findOne(id: number, userId: number, role: string) {
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
      throw new NotFoundException('Invoice not found');
    }

    // Transform the response to include the required fields
    return {
      ...foundInvoice,
      commissionAmount: foundInvoice.order.commissionAmount,
      providerAmount: foundInvoice.order.providerAmount,
      quantity: foundInvoice.order.quantity,
      discount: foundInvoice.discount || 0
    };
  }

  async updatePaymentStatus(id: number, updatePaymentStatusDto: UpdatePaymentStatusDto, userId: number, role: string) {
    const existingInvoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: { order: true }
    });

    if (!existingInvoice) {
      throw new NotFoundException('Invoice not found');
    }

    // Validate permissions
    if (role === 'PROVIDER' && existingInvoice.order.providerId !== userId) {
      throw new BadRequestException('You can only update invoices for your own orders');
    }

    if (role === 'USER' && existingInvoice.order.userId !== userId) {
      throw new BadRequestException('You can only update invoices for your own orders');
    }

    const updateData: any = {
      paymentStatus: updatePaymentStatusDto.paymentStatus
    };

    if (updatePaymentStatusDto.paymentMethod) {
      updateData.paymentMethod = updatePaymentStatusDto.paymentMethod;
    }

    if (updatePaymentStatusDto.paymentDate) {
      updateData.paymentDate = updatePaymentStatusDto.paymentDate;
    } else if (updatePaymentStatusDto.paymentStatus === 'paid') {
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

    // Transform the response to include the required fields
    return {
      ...updatedInvoice,
      commissionAmount: updatedInvoice.order.commissionAmount,
      providerAmount: updatedInvoice.order.providerAmount,
      quantity: updatedInvoice.order.quantity,
      discount: updatedInvoice.discount || 0
    };
  }

  async getPaymentStats(userId: number, role: string) {
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

    // Calculate total amounts
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

  async generateInvoiceReport(userId: number, role: string, startDate?: Date, endDate?: Date) {
    const where: any = role === 'PROVIDER'
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

  // Provider methods for payment confirmation
  async getProviderUnpaidInvoices(providerId: number) {
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

    // Transform the response to include the required fields
    return invoices.map(invoice => ({
      ...invoice,
      commissionAmount: invoice.order.commissionAmount,
      providerAmount: invoice.order.providerAmount,
      quantity: invoice.order.quantity,
      discount: invoice.discount || 0
    }));
  }
}

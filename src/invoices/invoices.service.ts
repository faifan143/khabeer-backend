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

    return this.prisma.invoice.create({
      data: {
        orderId: createInvoiceDto.orderId,
        totalAmount: createInvoiceDto.totalAmount,
        discount: createInvoiceDto.discount || 0,
        paymentStatus: 'pending',
        paymentMethod: createInvoiceDto.paymentMethod
      },
      include: {
        order: {
          include: {
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
  }

  async findAll(userId: number, role: string) {
    const where = role === 'PROVIDER'
      ? { order: { providerId: userId } }
      : { order: { userId } };

    return this.prisma.invoice.findMany({
      where,
      include: {
        order: {
          include: {
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
      },
      orderBy: {
        order: {
          orderDate: 'desc'
        }
      }
    });
  }

  async findOne(id: number, userId: number, role: string) {
    const where = role === 'PROVIDER'
      ? { id, order: { providerId: userId } }
      : { id, order: { userId } };

    const invoice = await this.prisma.invoice.findFirst({
      where,
      include: {
        order: {
          include: {
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

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return invoice;
  }

  async updatePaymentStatus(id: number, updatePaymentStatusDto: UpdatePaymentStatusDto, userId: number, role: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: { order: true }
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    // Validate permissions
    if (role === 'PROVIDER' && invoice.order.providerId !== userId) {
      throw new BadRequestException('You can only update invoices for your own orders');
    }

    if (role === 'USER' && invoice.order.userId !== userId) {
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

    return this.prisma.invoice.update({
      where: { id },
      data: updateData,
      include: {
        order: {
          include: {
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
          include: {
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
      paymentStatus: invoice.paymentStatus,
      paymentDate: invoice.paymentDate,
      orderDate: invoice.order.orderDate
    }));
  }

  // Provider methods for payment confirmation
  async confirmPayment(invoiceId: number, providerId: number) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        order: {
          include: {
            provider: true
          }
        }
      }
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    // Check if the provider is the one assigned to this order
    if (invoice.order.providerId !== providerId) {
      throw new BadRequestException('You can only confirm payments for your own orders');
    }

    if (invoice.paymentStatus !== 'paid') {
      throw new BadRequestException('Invoice must be marked as paid by user before confirmation');
    }

    if (invoice.isVerified) {
      throw new BadRequestException('Payment is already confirmed');
    }

    return this.prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        isVerified: true,
        verifiedBy: providerId,
        verifiedAt: new Date()
      },
      include: {
        order: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            provider: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });
  }

  async getProviderPendingConfirmations(providerId: number) {
    return this.prisma.invoice.findMany({
      where: {
        paymentStatus: 'paid',
        isVerified: false,
        order: {
          providerId: providerId
        }
      },
      include: {
        order: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            service: {
              select: {
                title: true
              }
            }
          }
        }
      },
      orderBy: {
        paymentDate: 'desc'
      }
    });
  }
}

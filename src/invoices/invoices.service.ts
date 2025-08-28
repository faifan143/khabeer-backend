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
            isMultipleServices: true,
            servicesBreakdown: true,
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
                commission: true,
                category: {
                  select: {
                    id: true,
                    image: true,
                    titleAr: true,
                    titleEn: true,
                    state: true
                  }
                }
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

    // Transform the response to include the required fields and services array
    return invoices.map(invoice => {
      let services: any[] = [];

      if (invoice.order.isMultipleServices && invoice.order.servicesBreakdown) {
        // Use the stored services breakdown from the database and enhance with category data
        services = (invoice.order.servicesBreakdown as any[]).map(serviceItem => ({
          ...serviceItem,
          category: invoice.order.service.category
        }));
      } else {
        // For single service orders, create a single-item array with complete data
        const service = invoice.order.service;
        services = [
          {
            serviceId: service.id,
            serviceTitle: service.title,
            serviceDescription: service.description,
            quantity: invoice.order.quantity,
            unitPrice: invoice.order.providerAmount / invoice.order.quantity,
            totalPrice: invoice.order.providerAmount,
            commission: service.commission || 0,
            commissionAmount: invoice.order.commissionAmount,
            category: service.category
          }
        ];
      }

      // Remove the main service attribute and return only the services array
      const { service, ...orderWithoutService } = invoice.order;

      return {
        ...invoice,
        commissionAmount: invoice.order.commissionAmount,
        providerAmount: invoice.order.providerAmount,
        quantity: invoice.order.quantity,
        discount: invoice.discount || 0,
        order: {
          ...orderWithoutService,
          isMultipleServices: invoice.order.isMultipleServices || false,
          services
        }
      };
    });
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
            isMultipleServices: true,
            servicesBreakdown: true,
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
                commission: true,
                category: {
                  select: {
                    id: true,
                    image: true,
                    titleAr: true,
                    titleEn: true,
                    state: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!foundInvoice) {
      throw new NotFoundException('Invoice not found');
    }

    // Transform the response to include the required fields and services array
    let services: any[] = [];

    if (foundInvoice.order.isMultipleServices && foundInvoice.order.servicesBreakdown) {
      // Use the stored services breakdown from the database and enhance with category data
      services = (foundInvoice.order.servicesBreakdown as any[]).map(serviceItem => ({
        ...serviceItem,
        category: foundInvoice.order.service.category
      }));
    } else {
      // For single service orders, create a single-item array with complete data
      const service = foundInvoice.order.service;
      services = [
        {
          serviceId: service.id,
          serviceTitle: service.title,
          serviceDescription: service.description,
          quantity: foundInvoice.order.quantity,
          unitPrice: foundInvoice.order.providerAmount / foundInvoice.order.quantity,
          totalPrice: foundInvoice.order.providerAmount,
          commission: service.commission || 0,
          commissionAmount: foundInvoice.order.commissionAmount,
          category: service.category
        }
      ];
    }

    // Remove the main service attribute and return only the services array
    const { service, ...orderWithoutService } = foundInvoice.order;

    return {
      ...foundInvoice,
      commissionAmount: foundInvoice.order.commissionAmount,
      providerAmount: foundInvoice.order.providerAmount,
      quantity: foundInvoice.order.quantity,
      discount: foundInvoice.discount || 0,
      order: {
        ...orderWithoutService,
        isMultipleServices: foundInvoice.order.isMultipleServices || false,
        services
      }
    };
  }

  async updatePaymentStatus(id: number, updatePaymentStatusDto: UpdatePaymentStatusDto, userId: number, role: string) {
    const existingInvoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            provider: true,
            user: true,
            service: true
          }
        }
      }
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

    const oldStatus = existingInvoice.paymentStatus;
    const newStatus = updatePaymentStatusDto.paymentStatus;

    // Validate status transition
    if (!this.isValidStatusTransition(oldStatus, newStatus)) {
      throw new BadRequestException(`Invalid status transition from ${oldStatus} to ${newStatus}`);
    }

    const updateData: any = {
      paymentStatus: newStatus,
      updatedAt: new Date()
    };

    if (updatePaymentStatusDto.paymentMethod) {
      updateData.paymentMethod = updatePaymentStatusDto.paymentMethod;
    }

    if (updatePaymentStatusDto.paymentDate) {
      updateData.paymentDate = updatePaymentStatusDto.paymentDate;
    } else if (newStatus === 'paid') {
      updateData.paymentDate = new Date();
    }

    // Handle financial calculations and order status updates
    await this.handleFinancialCalculations(existingInvoice, oldStatus, newStatus);

    const updatedInvoice = await this.prisma.invoice.update({
      where: { id },
      data: updateData,
      include: {
        order: {
          select: {
            commissionAmount: true,
            providerAmount: true,
            quantity: true,
            isMultipleServices: true,
            servicesBreakdown: true,
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
                description: true,
                commission: true,
                category: {
                  select: {
                    id: true,
                    image: true,
                    titleAr: true,
                    titleEn: true,
                    state: true
                  }
                }
              }
            }
          }
        }
      }
    });

    // Transform the response to include the required fields and services array
    let services: any[] = [];

    if (updatedInvoice.order.isMultipleServices && updatedInvoice.order.servicesBreakdown) {
      // Use the stored services breakdown from the database and enhance with category data
      services = (updatedInvoice.order.servicesBreakdown as any[]).map(serviceItem => ({
        ...serviceItem,
        category: updatedInvoice.order.service.category
      }));
    } else {
      // For single service orders, create a single-item array with complete data
      const service = updatedInvoice.order.service;
      services = [
        {
          serviceId: service.id,
          serviceTitle: service.title,
          serviceDescription: service.description,
          quantity: updatedInvoice.order.quantity,
          unitPrice: updatedInvoice.order.providerAmount / updatedInvoice.order.quantity,
          totalPrice: updatedInvoice.order.providerAmount,
          commission: service.commission || 0,
          commissionAmount: updatedInvoice.order.commissionAmount,
          category: service.category
        }
      ];
    }

    // Remove the main service attribute and return only the services array
    const { service, ...orderWithoutService } = updatedInvoice.order;

    return {
      ...updatedInvoice,
      commissionAmount: updatedInvoice.order.commissionAmount,
      providerAmount: updatedInvoice.order.providerAmount,
      quantity: updatedInvoice.order.quantity,
      discount: updatedInvoice.discount || 0,
      order: {
        ...orderWithoutService,
        isMultipleServices: updatedInvoice.order.isMultipleServices || false,
        services
      }
    };
  }

  /**
   * Validate status transitions
   */
  private isValidStatusTransition(oldStatus: string, newStatus: string): boolean {
    const validTransitions: { [key: string]: string[] } = {
      'pending': ['paid', 'failed'],
      'paid': ['refunded'],
      'failed': ['pending', 'paid'],
      'refunded': [] // No further transitions allowed
    };

    return validTransitions[oldStatus]?.includes(newStatus) || false;
  }

  /**
   * Handle financial calculations and order status updates based on payment status change
   */
  private async handleFinancialCalculations(
    invoice: any,
    oldStatus: string,
    newStatus: string
  ): Promise<void> {
    const order = invoice.order;

    switch (newStatus) {
      case 'paid':
        // CRITICAL: Admin marking as paid = payment is committed to company
        await this.commitPaymentToCompany(order, invoice);

        // Update order status to paid
        await this.prisma.order.update({
          where: { id: order.id },
          data: { status: 'paid' }
        });

        // Validate commission calculation
        this.validateCommissionCalculation(order, invoice);

        // Log commission earned (for admin tracking)
        console.log(`Commission earned: ${order.commissionAmount} for order ${order.id}`);
        console.log(`Provider earnings: ${order.providerAmount} for order ${order.id}`);
        break;

      case 'failed':
        // Update order status to payment_failed
        await this.prisma.order.update({
          where: { id: order.id },
          data: { status: 'payment_failed' }
        });

        // No commission earned on failed payments
        console.log(`Payment failed for order ${order.id} - no commission earned`);
        break;

      case 'refunded':
        // Update order status to refunded
        await this.prisma.order.update({
          where: { id: order.id },
          data: { status: 'refunded' }
        });

        // Handle refund calculations
        this.handleRefundCalculations(order, invoice);
        break;

      case 'pending':
        // Reset order status back to pending
        await this.prisma.order.update({
          where: { id: order.id },
          data: { status: 'pending' }
        });
        break;
    }
  }

  /**
   * CRITICAL: Commit payment to company when admin marks invoice as paid
   * This represents the actual moment when money is committed
   */
  private async commitPaymentToCompany(order: any, invoice: any): Promise<void> {
    console.log(`🚨 PAYMENT COMMITTED TO COMPANY 🚨`);
    console.log(`Order: ${order.id}`);
    console.log(`Total Amount: ${invoice.totalAmount} SAR`);
    console.log(`Commission: ${order.commissionAmount} SAR`);
    console.log(`Provider Amount: ${order.providerAmount} SAR`);
    console.log(`Commitment Time: ${new Date().toISOString()}`);

    // Here you would typically:
    // 1. Create financial transaction records
    // 2. Update company revenue
    // 3. Schedule provider payout
    // 4. Send notifications
    // 5. Update accounting systems

    // For now, we'll log the commitment
    await this.logPaymentCommitment(order, invoice);
  }

  /**
   * Log payment commitment for audit purposes
   */
  private async logPaymentCommitment(order: any, invoice: any): Promise<void> {
    // This would typically create a financial commitment record
    // For now, we'll use console logging for demonstration

    const commitmentData = {
      orderId: order.id,
      invoiceId: invoice.id,
      totalAmount: invoice.totalAmount,
      commissionAmount: order.commissionAmount,
      providerAmount: order.providerAmount,
      commitmentTime: new Date(),
      status: 'committed',
      type: 'admin_payment_commitment'
    };

    console.log('📊 PAYMENT COMMITMENT LOGGED:', commitmentData);

    // In a real system, you would:
    // - Create a financial commitment record
    // - Update company revenue tracking
    // - Trigger accounting system updates
    // - Send notifications to stakeholders
  }

  /**
   * Validate commission calculation
   */
  private validateCommissionCalculation(order: any, invoice: any): void {
    const commissionAmount = order.commissionAmount;
    const providerAmount = order.providerAmount;
    const totalAmount = invoice.totalAmount;

    // Validate that commission + provider amount equals total (with small tolerance for rounding)
    if (Math.abs((commissionAmount + providerAmount) - totalAmount) > 0.01) {
      console.warn(`Commission calculation mismatch for order ${order.id}: commission=${commissionAmount}, provider=${providerAmount}, total=${totalAmount}`);
    }

    // Validate commission percentage
    const expectedCommission = (order.service.commission / 100) * totalAmount;
    if (Math.abs(commissionAmount - expectedCommission) > 0.01) {
      console.warn(`Commission percentage mismatch for order ${order.id}: expected=${expectedCommission}, actual=${commissionAmount}`);
    }
  }

  /**
   * Handle refund calculations
   */
  private handleRefundCalculations(order: any, invoice: any): void {
    // When refunding, we need to:
    // 1. Reverse the commission calculation
    // 2. Ensure provider doesn't get paid for refunded orders
    // 3. Log the refund for financial tracking

    console.log(`Processing refund for order ${order.id}:`);
    console.log(`  - Total amount: ${invoice.totalAmount}`);
    console.log(`  - Commission reversed: ${order.commissionAmount}`);
    console.log(`  - Provider earnings reversed: ${order.providerAmount}`);
    console.log(`  - Net impact: ${order.commissionAmount + order.providerAmount}`);
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
            isMultipleServices: true,
            servicesBreakdown: true,
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

    return invoices.map(invoice => {
      // Handle multiple services for reporting
      let serviceTitle = invoice.order.service.title;
      let totalQuantity = invoice.order.quantity;

      if (invoice.order.isMultipleServices && invoice.order.servicesBreakdown) {
        const services = invoice.order.servicesBreakdown as any[];
        serviceTitle = services.map(s => `${s.serviceTitle} (${s.quantity})`).join(', ');
        totalQuantity = services.reduce((sum, s) => sum + s.quantity, 0);
      }

      return {
        invoiceId: invoice.id,
        orderId: invoice.order.id,
        serviceTitle,
        totalAmount: invoice.totalAmount,
        discount: invoice.discount,
        netAmount: invoice.totalAmount - invoice.discount,
        commission: invoice.order.service.commission,
        commissionAmount: invoice.order.commissionAmount,
        providerAmount: invoice.order.providerAmount,
        quantity: totalQuantity,
        paymentStatus: invoice.paymentStatus,
        paymentDate: invoice.paymentDate,
        orderDate: invoice.order.orderDate,
        isMultipleServices: invoice.order.isMultipleServices || false
      };
    });
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
            isMultipleServices: true,
            servicesBreakdown: true,
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
                description: true,
                commission: true,
                category: {
                  select: {
                    id: true,
                    image: true,
                    titleAr: true,
                    titleEn: true,
                    state: true
                  }
                }
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

    // Transform the response to include the required fields and services array
    return invoices.map(invoice => {
      let services: any[] = [];

      if (invoice.order.isMultipleServices && invoice.order.servicesBreakdown) {
        // Use the stored services breakdown from the database and enhance with category data
        services = (invoice.order.servicesBreakdown as any[]).map(serviceItem => ({
          ...serviceItem,
          category: invoice.order.service.category
        }));
      } else {
        // For single service orders, create a single-item array with complete data
        const service = invoice.order.service;
        services = [
          {
            serviceId: service.id,
            serviceTitle: service.title,
            serviceDescription: service.description,
            quantity: invoice.order.quantity,
            unitPrice: invoice.order.providerAmount / invoice.order.quantity,
            totalPrice: invoice.order.providerAmount,
            commission: service.commission || 0,
            commissionAmount: invoice.order.commissionAmount,
            category: service.category
          }
        ];
      }

      // Remove the main service attribute and return only the services array
      const { service, ...orderWithoutService } = invoice.order;

      return {
        ...invoice,
        commissionAmount: invoice.order.commissionAmount,
        providerAmount: invoice.order.providerAmount,
        quantity: invoice.order.quantity,
        discount: invoice.discount || 0,
        order: {
          ...orderWithoutService,
          isMultipleServices: invoice.order.isMultipleServices || false,
          services
        }
      };
    });
  }

  /**
   * Get financial summary for admin dashboard
   * Includes commission calculations and provider earnings
   */
  async getAdminFinancialSummary(startDate?: Date, endDate?: Date) {
    const where: any = {};

    if (startDate || endDate) {
      where.order = {
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
            commissionAmount: true,
            providerAmount: true,
            totalAmount: true
          }
        }
      }
    });

    // Calculate comprehensive financial metrics
    const paidInvoices = invoices.filter(inv => inv.paymentStatus === 'paid');
    const refundedInvoices = invoices.filter(inv => inv.paymentStatus === 'refunded');
    const failedInvoices = invoices.filter(inv => inv.paymentStatus === 'failed');

    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const paidRevenue = paidInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const refundedRevenue = refundedInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const failedRevenue = failedInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);

    // Commission calculations
    const totalCommission = paidInvoices.reduce((sum, inv) => sum + inv.order.commissionAmount, 0);
    const refundedCommission = refundedInvoices.reduce((sum, inv) => sum + inv.order.commissionAmount, 0);
    const netCommission = totalCommission - refundedCommission;

    // Provider earnings calculations
    const totalProviderEarnings = paidInvoices.reduce((sum, inv) => sum + inv.order.providerAmount, 0);
    const refundedProviderEarnings = refundedInvoices.reduce((sum, inv) => sum + inv.order.providerAmount, 0);
    const netProviderEarnings = totalProviderEarnings - refundedProviderEarnings;

    // Net revenue after refunds
    const netRevenue = paidRevenue - refundedRevenue;

    return {
      // Revenue breakdown
      totalRevenue,
      paidRevenue,
      refundedRevenue,
      failedRevenue,
      netRevenue,

      // Commission breakdown
      totalCommission,
      refundedCommission,
      netCommission,
      commissionRate: paidRevenue > 0 ? (netCommission / netRevenue) * 100 : 0,

      // Provider earnings
      totalProviderEarnings,
      refundedProviderEarnings,
      netProviderEarnings,
      providerEarningsRate: paidRevenue > 0 ? (netProviderEarnings / netRevenue) * 100 : 0,

      // Invoice counts
      totalInvoices: invoices.length,
      paidCount: paidInvoices.length,
      refundedCount: refundedInvoices.length,
      failedCount: failedInvoices.length,

      // Performance metrics
      successRate: invoices.length > 0 ? (paidInvoices.length / invoices.length) * 100 : 0,
      refundRate: paidInvoices.length > 0 ? (refundedInvoices.length / paidInvoices.length) * 100 : 0,
      averageOrderValue: invoices.length > 0 ? totalRevenue / invoices.length : 0,
      averageCommission: paidInvoices.length > 0 ? totalCommission / paidInvoices.length : 0,
      averageProviderEarnings: paidInvoices.length > 0 ? totalProviderEarnings / paidInvoices.length : 0
    };
  }
}

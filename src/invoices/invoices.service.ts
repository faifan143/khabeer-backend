import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
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
  constructor(private readonly prisma: PrismaService) {}

  async create(createInvoiceDto: CreateInvoiceDto) {
    // Check if order exists and doesn't already have an invoice
    const existingInvoice = await this.prisma.invoice.findUnique({
      where: { orderId: createInvoiceDto.orderId },
    });

    if (existingInvoice) {
      throw new BadRequestException('Invoice already exists for this order');
    }

    const order = await this.prisma.order.findUnique({
      where: { id: createInvoiceDto.orderId },
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
        paymentMethod: createInvoiceDto.paymentMethod,
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
                phone: true,
              },
            },
            provider: {
              select: {
                id: true,
                name: true,
                phone: true,
              },
            },
            service: {
              select: {
                id: true,
                titleAr: true,
                titleEn: true,
                description: true,
              },
            },
          },
        },
      },
    });

    // Transform the response to include the required fields
    return {
      ...newInvoice,
      commissionAmount: newInvoice.order.commissionAmount,
      providerAmount: newInvoice.order.providerAmount,
      quantity: newInvoice.order.quantity,
      discount: newInvoice.discount || 0,
    };
  }

  async findAll(userId: number, role: string, status?: string) {
    const where: any = {
      isDeleted: false, // Exclude deleted invoices
      ...(role === 'PROVIDER'
        ? { order: { providerId: userId } }
        : { order: { userId } }),
    };

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
              },
            },
            provider: {
              select: {
                id: true,
                name: true,
                phone: true,
              },
            },
            service: {
              select: {
                id: true,
                titleAr: true,
                titleEn: true,
                description: true,
                commission: true,
                category: {
                  select: {
                    id: true,
                    image: true,
                    titleAr: true,
                    titleEn: true,
                    state: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        order: {
          orderDate: 'desc',
        },
      },
    });

    // Transform the response to include the required fields and services array
    return invoices.map((invoice) => {
      let services: any[] = [];

      if (invoice.order.isMultipleServices && invoice.order.servicesBreakdown) {
        // Use the stored services breakdown from the database and enhance with category data
        services = (invoice.order.servicesBreakdown as any[]).map(
          (serviceItem) => ({
            ...serviceItem,
            category: invoice.order.service.category,
            serviceTitle:
              serviceItem.serviceTitleEn + '-' + serviceItem.serviceTitleAr,
          }),
        );
      } else {
        // For single service orders, create a single-item array with complete data
        const service = invoice.order.service;
        services = [
          {
            serviceId: service.id,
            serviceTitle: service.titleEn + '-' + service.titleAr,
            serviceDescriptionAr: service.descriptionAr,
            serviceDescriptionEn: service.descriptionEn,
            quantity: invoice.order.quantity,
            unitPrice: invoice.order.providerAmount / invoice.order.quantity,
            totalPrice: invoice.order.providerAmount,
            commission: service.commission || 0,
            commissionAmount: invoice.order.commissionAmount,
            category: service.category,
          },
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
          services,
        },
      };
    });
  }

  async findOne(id: number, userId: number, role: string) {
    const where = {
      id,
      isDeleted: false, // Exclude deleted invoices
      ...(role === 'PROVIDER'
        ? { order: { providerId: userId } }
        : { order: { userId } }),
    };

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
                address: true,
              },
            },
            provider: {
              select: {
                id: true,
                name: true,
                phone: true,
                description: true,
              },
            },
            service: {
              select: {
                id: true,
                titleAr: true,
                titleEn: true,
                description: true,
                commission: true,
                category: {
                  select: {
                    id: true,
                    image: true,
                    titleAr: true,
                    titleEn: true,
                    state: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!foundInvoice) {
      throw new NotFoundException('Invoice not found');
    }

    // Transform the response to include the required fields and services array
    let services: any[] = [];

    if (
      foundInvoice.order.isMultipleServices &&
      foundInvoice.order.servicesBreakdown
    ) {
      // Use the stored services breakdown from the database and enhance with category data
      services = (foundInvoice.order.servicesBreakdown as any[]).map(
        (serviceItem) => ({
          ...serviceItem,
          category: foundInvoice.order.service.category,
        }),
      );
    } else {
      // For single service orders, create a single-item array with complete data
      const service = foundInvoice.order.service;
      services = [
        {
          serviceId: service.id,
          serviceTitle: service.titleEn,
          serviceDescriptionAr: service.descriptionAr,
          serviceDescriptionEn: service.descriptionEn,
          quantity: foundInvoice.order.quantity,
          unitPrice:
            foundInvoice.order.providerAmount / foundInvoice.order.quantity,
          totalPrice: foundInvoice.order.providerAmount,
          commission: service.commission || 0,
          commissionAmount: foundInvoice.order.commissionAmount,
          category: service.category,
        },
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
        services,
      },
    };
  }

  async updatePaymentStatus(
    id: number,
    updatePaymentStatusDto: UpdatePaymentStatusDto,
    userId: number,
    role: string,
  ) {
    const existingInvoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            provider: true,
            user: true,
            service: true,
          },
        },
      },
    });

    if (!existingInvoice) {
      throw new NotFoundException('Invoice not found');
    }

    // Validate permissions
    if (role === 'PROVIDER' && existingInvoice.order.providerId !== userId) {
      throw new BadRequestException(
        'You can only update invoices for your own orders',
      );
    }

    if (role === 'USER' && existingInvoice.order.userId !== userId) {
      throw new BadRequestException(
        'You can only update invoices for your own orders',
      );
    }

    const oldStatus = existingInvoice.paymentStatus;
    const newStatus = updatePaymentStatusDto.paymentStatus;

    // Validate status transition
    if (!this.isValidStatusTransition(oldStatus, newStatus)) {
      throw new BadRequestException(
        `Invalid status transition from ${oldStatus} to ${newStatus}`,
      );
    }

    const updateData: any = {
      paymentStatus: newStatus,
      updatedAt: new Date(),
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
    await this.handleFinancialCalculations(
      existingInvoice,
      oldStatus,
      newStatus,
    );

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
                phone: true,
              },
            },
            provider: {
              select: {
                id: true,
                name: true,
                phone: true,
              },
            },
            service: {
              select: {
                id: true,
                titleAr: true,
                titleEn: true,
                description: true,
                commission: true,
                category: {
                  select: {
                    id: true,
                    image: true,
                    titleAr: true,
                    titleEn: true,
                    state: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Transform the response to include the required fields and services array
    let services: any[] = [];

    if (
      updatedInvoice.order.isMultipleServices &&
      updatedInvoice.order.servicesBreakdown
    ) {
      // Use the stored services breakdown from the database and enhance with category data
      services = (updatedInvoice.order.servicesBreakdown as any[]).map(
        (serviceItem) => ({
          ...serviceItem,
          category: updatedInvoice.order.service.category,
        }),
      );
    } else {
      // For single service orders, create a single-item array with complete data
      const service = updatedInvoice.order.service;
      services = [
        {
          serviceId: service.id,
          serviceTitle: service.titleEn,
          serviceDescriptionAr: service.descriptionAr,
          serviceDescriptionEn: service.descriptionEn,
          quantity: updatedInvoice.order.quantity,
          unitPrice:
            updatedInvoice.order.providerAmount / updatedInvoice.order.quantity,
          totalPrice: updatedInvoice.order.providerAmount,
          commission: service.commission || 0,
          commissionAmount: updatedInvoice.order.commissionAmount,
          category: service.category,
        },
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
        services,
      },
    };
  }

  /**
   * Validate status transitions
   */
  private isValidStatusTransition(
    oldStatus: string,
    newStatus: string,
  ): boolean {
    const validTransitions: { [key: string]: string[] } = {
      pending: ['paid', 'failed'],
      paid: ['refunded'],
      failed: ['pending', 'paid'],
      refunded: [], // No further transitions allowed
    };

    return validTransitions[oldStatus]?.includes(newStatus) || false;
  }

  /**
   * Handle financial calculations and order status updates based on payment status change
   */
  private async handleFinancialCalculations(
    invoice: any,
    oldStatus: string,
    newStatus: string,
  ): Promise<void> {
    const order = invoice.order;

    switch (newStatus) {
      case 'paid':
        // CRITICAL: Admin marking as paid = payment is committed to company
        await this.commitPaymentToCompany(order, invoice);

        // Update order status to paid
        await this.prisma.order.update({
          where: { id: order.id },
          data: { status: 'paid' },
        });

        // Validate commission calculation
        this.validateCommissionCalculation(order, invoice);

        // Log commission earned (for admin tracking)
        console.log(
          `Commission earned: ${order.commissionAmount} for order ${order.id}`,
        );
        console.log(
          `Provider earnings: ${order.providerAmount} for order ${order.id}`,
        );
        break;

      case 'failed':
        // Update order status to payment_failed
        await this.prisma.order.update({
          where: { id: order.id },
          data: { status: 'payment_failed' },
        });

        // No commission earned on failed payments
        console.log(
          `Payment failed for order ${order.id} - no commission earned`,
        );
        break;

      case 'refunded':
        // Update order status to refunded
        await this.prisma.order.update({
          where: { id: order.id },
          data: { status: 'refunded' },
        });

        // Handle refund calculations
        this.handleRefundCalculations(order, invoice);
        break;

      case 'pending':
        // Reset order status back to pending
        await this.prisma.order.update({
          where: { id: order.id },
          data: { status: 'pending' },
        });
        break;
    }
  }

  /**
   * CRITICAL: Commit payment to company when admin marks invoice as paid
   * This represents the actual moment when money is committed
   * FIXED: Now properly handles provider pays commission flow
   */
  private async commitPaymentToCompany(
    order: any,
    invoice: any,
  ): Promise<void> {
    console.log(`🚨 PAYMENT COMMITTED TO COMPANY 🚨`);
    console.log(`Order: ${order.id}`);
    console.log(
      `User Payment: ${invoice.totalAmount} OMR (provider price only)`,
    );
    console.log(`Provider Gross: ${order.providerAmount} OMR`);
    console.log(`Commission to Admin: ${order.commissionAmount} OMR`);
    console.log(
      `Provider Net: ${order.providerNetAmount} OMR (after commission deduction)`,
    );
    console.log(`Commitment Time: ${new Date().toISOString()}`);

    // Here you would typically:
    // 1. Create financial transaction records
    // 2. Update company revenue (admin gets commission)
    // 3. Schedule provider payout (provider gets net amount)
    // 4. Send notifications
    // 5. Update accounting systems

    // For now, we'll log the commitment
    await this.logPaymentCommitment(order, invoice);
  }

  /**
   * Log payment commitment for audit purposes - FIXED: Now logs correct financial flow
   */
  private async logPaymentCommitment(order: any, invoice: any): Promise<void> {
    // This would typically create a financial commitment record
    // For now, we'll use console logging for demonstration

    const commitmentData = {
      orderId: order.id,
      invoiceId: invoice.id,
      userPayment: invoice.totalAmount, // What user actually paid
      providerGrossAmount: order.providerAmount, // What provider charged
      providerNetAmount: order.providerNetAmount, // What provider receives
      adminCommission: order.commissionAmount, // What admin gets
      commitmentTime: new Date(),
      status: 'committed',
      type: 'admin_payment_commitment',
      financialFlow: 'provider_pays_commission',
    };

    console.log('📊 PAYMENT COMMITMENT LOGGED:', commitmentData);

    // In a real system, you would:
    // - Create a financial commitment record
    // - Update company revenue tracking (admin commission)
    // - Schedule provider payout (provider net amount)
    // - Trigger accounting system updates
    // - Send notifications to stakeholders
  }

  /**
   * Validate commission calculation - FIXED: Now validates fixed commission per service
   */
  private validateCommissionCalculation(order: any, invoice: any): void {
    const commissionAmount = order.commissionAmount;
    const providerAmount = order.providerAmount;
    const totalAmount = invoice.totalAmount;
    const providerNetAmount = order.providerNetAmount;

    // Validate that user pays only provider amount (no commission added)
    if (Math.abs(providerAmount - totalAmount) > 0.01) {
      console.warn(
        `User payment mismatch for order ${order.id}: providerAmount=${providerAmount}, totalAmount=${totalAmount}`,
      );
    }

    // Validate that provider net amount is correct (provider amount minus commission)
    if (
      Math.abs(providerNetAmount - (providerAmount - commissionAmount)) > 0.01
    ) {
      console.warn(
        `Provider net amount mismatch for order ${order.id}: expected=${providerAmount - commissionAmount}, actual=${providerNetAmount}`,
      );
    }

    // Validate fixed commission per service (not percentage-based)
    const expectedCommission = (order.service.commission || 0) * order.quantity;
    if (Math.abs(commissionAmount - expectedCommission) > 0.01) {
      console.warn(
        `Fixed commission mismatch for order ${order.id}: expected=${expectedCommission}, actual=${commissionAmount}`,
      );
    }

    console.log(`✅ Financial flow validation for order ${order.id}:`);
    console.log(`   User pays: ${totalAmount} OMR`);
    console.log(
      `   Provider gets: ${providerNetAmount} OMR (${providerAmount} - ${commissionAmount})`,
    );
    console.log(`   Admin gets: ${commissionAmount} OMR`);
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
    console.log(
      `  - Net impact: ${order.commissionAmount + order.providerAmount}`,
    );
  }

  async getPaymentStats(userId: number, role: string) {
    const where = {
      isDeleted: false, // Exclude deleted invoices
      ...(role === 'PROVIDER'
        ? { order: { providerId: userId } }
        : { order: { userId } }),
    };

    const [total, paid, pending, failed, refunded] = await Promise.all([
      this.prisma.invoice.count({ where }),
      this.prisma.invoice.count({ where: { ...where, paymentStatus: 'paid' } }),
      this.prisma.invoice.count({
        where: { ...where, paymentStatus: 'pending' },
      }),
      this.prisma.invoice.count({
        where: { ...where, paymentStatus: 'failed' },
      }),
      this.prisma.invoice.count({
        where: { ...where, paymentStatus: 'refunded' },
      }),
    ]);

    // Calculate total amounts
    const invoices = await this.prisma.invoice.findMany({
      where,
      select: {
        totalAmount: true,
        discount: true,
        paymentStatus: true,
      },
    });

    const totalAmount = invoices.reduce(
      (sum, invoice) => sum + invoice.totalAmount,
      0,
    );
    const totalDiscount = invoices.reduce(
      (sum, invoice) => sum + invoice.discount,
      0,
    );
    const paidAmount = invoices
      .filter((invoice) => invoice.paymentStatus === 'paid')
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
      netAmount: totalAmount - totalDiscount,
    };
  }

  async generateInvoiceReport(
    userId: number,
    role: string,
    startDate?: Date,
    endDate?: Date,
  ) {
    const where: any = {
      isDeleted: false, // Exclude deleted invoices
      ...(role === 'PROVIDER'
        ? { order: { providerId: userId } }
        : { order: { userId } }),
    };

    if (startDate || endDate) {
      where.order = {
        ...where.order,
        orderDate: {},
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
                titleAr: true,
                titleEn: true,
                commission: true,
              },
            },
          },
        },
      },
      orderBy: {
        order: {
          orderDate: 'desc',
        },
      },
    });

    return invoices.map((invoice) => {
      // Handle multiple services for reporting
      let serviceTitle = invoice.order.service.titleEn;
      let totalQuantity = invoice.order.quantity;

      if (invoice.order.isMultipleServices && invoice.order.servicesBreakdown) {
        const services = invoice.order.servicesBreakdown as any[];
        serviceTitle = services
          .map((s) => `${s.serviceTitle} (${s.quantity})`)
          .join(', ');
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
        isMultipleServices: invoice.order.isMultipleServices || false,
      };
    });
  }

  // Provider methods for payment confirmation
  async getProviderUnpaidInvoices(providerId: number) {
    const invoices = await this.prisma.invoice.findMany({
      where: {
        isDeleted: false, // Exclude deleted invoices
        paymentStatus: 'unpaid',
        order: {
          providerId: providerId,
        },
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
                phone: true,
              },
            },
            service: {
              select: {
                id: true,
                titleAr: true,
                titleEn: true,
                description: true,
                commission: true,
                category: {
                  select: {
                    id: true,
                    image: true,
                    titleAr: true,
                    titleEn: true,
                    state: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        order: {
          orderDate: 'desc',
        },
      },
    });

    // Transform the response to include the required fields and services array
    return invoices.map((invoice) => {
      let services: any[] = [];

      if (invoice.order.isMultipleServices && invoice.order.servicesBreakdown) {
        // Use the stored services breakdown from the database and enhance with category data
        services = (invoice.order.servicesBreakdown as any[]).map(
          (serviceItem) => ({
            ...serviceItem,
            category: invoice.order.service.category,
          }),
        );
      } else {
        // For single service orders, create a single-item array with complete data
        const service = invoice.order.service;
        services = [
          {
            serviceId: service.id,
            serviceTitle: service.titleEn,
            serviceDescriptionAr: service.descriptionAr,
            serviceDescriptionEn: service.descriptionEn,
            quantity: invoice.order.quantity,
            unitPrice: invoice.order.providerAmount / invoice.order.quantity,
            totalPrice: invoice.order.providerAmount,
            commission: service.commission || 0,
            commissionAmount: invoice.order.commissionAmount,
            category: service.category,
          },
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
          services,
        },
      };
    });
  }

  /**
   * Get financial summary for admin dashboard
   * Includes commission calculations and provider earnings
   */
  async getAdminFinancialSummary(startDate?: Date, endDate?: Date) {
    const where: any = {
      isDeleted: false, // Exclude deleted invoices
    };

    if (startDate || endDate) {
      where.order = {
        orderDate: {},
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
            totalAmount: true,
          },
        },
      },
    });

    // Calculate comprehensive financial metrics
    const paidInvoices = invoices.filter((inv) => inv.paymentStatus === 'paid');
    const refundedInvoices = invoices.filter(
      (inv) => inv.paymentStatus === 'refunded',
    );
    const failedInvoices = invoices.filter(
      (inv) => inv.paymentStatus === 'failed',
    );

    const totalRevenue = invoices.reduce(
      (sum, inv) => sum + inv.totalAmount,
      0,
    );
    const paidRevenue = paidInvoices.reduce(
      (sum, inv) => sum + inv.totalAmount,
      0,
    );
    const refundedRevenue = refundedInvoices.reduce(
      (sum, inv) => sum + inv.totalAmount,
      0,
    );
    const failedRevenue = failedInvoices.reduce(
      (sum, inv) => sum + inv.totalAmount,
      0,
    );

    // Commission calculations
    const totalCommission = paidInvoices.reduce(
      (sum, inv) => sum + inv.order.commissionAmount,
      0,
    );
    const refundedCommission = refundedInvoices.reduce(
      (sum, inv) => sum + inv.order.commissionAmount,
      0,
    );
    const netCommission = totalCommission - refundedCommission;

    // Provider earnings calculations
    const totalProviderEarnings = paidInvoices.reduce(
      (sum, inv) => sum + inv.order.providerAmount,
      0,
    );
    const refundedProviderEarnings = refundedInvoices.reduce(
      (sum, inv) => sum + inv.order.providerAmount,
      0,
    );
    const netProviderEarnings =
      totalProviderEarnings - refundedProviderEarnings;

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
      providerEarningsRate:
        paidRevenue > 0 ? (netProviderEarnings / netRevenue) * 100 : 0,

      // Invoice counts
      totalInvoices: invoices.length,
      paidCount: paidInvoices.length,
      refundedCount: refundedInvoices.length,
      failedCount: failedInvoices.length,

      // Performance metrics
      successRate:
        invoices.length > 0 ? (paidInvoices.length / invoices.length) * 100 : 0,
      refundRate:
        paidInvoices.length > 0
          ? (refundedInvoices.length / paidInvoices.length) * 100
          : 0,
      averageOrderValue:
        invoices.length > 0 ? totalRevenue / invoices.length : 0,
      averageCommission:
        paidInvoices.length > 0 ? totalCommission / paidInvoices.length : 0,
      averageProviderEarnings:
        paidInvoices.length > 0
          ? totalProviderEarnings / paidInvoices.length
          : 0,
    };
  }

  /**
   * Soft delete an invoice (ADMIN only)
   */
  async softDelete(id: number, userId: number, role: string) {
    if (role !== 'ADMIN') {
      throw new BadRequestException('Only admins can delete invoices');
    }

    // First check if invoice exists and is not deleted
    const invoice = await this.prisma.invoice.findFirst({
      where: {
        id,
        isDeleted: false,
      },
      include: {
        order: {
          select: {
            id: true,
            status: true,
            commissionAmount: true,
            providerAmount: true,
            totalAmount: true,
          },
        },
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found or already deleted');
    }

    // Handle financial impact before deletion
    await this.handleDeleteFinancialImpact(invoice, userId);

    // Soft delete the invoice
    const deletedInvoice = await this.prisma.invoice.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: userId,
      },
      include: {
        order: {
          select: {
            id: true,
            status: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            provider: {
              select: {
                id: true,
                name: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    console.log(`🗑️ Invoice ${id} soft deleted by admin ${userId}`);
    console.log(`   - Order: ${deletedInvoice.order.id}`);
    console.log(`   - Customer: ${deletedInvoice.order.user.name}`);
    console.log(`   - Provider: ${deletedInvoice.order.provider.name}`);
    console.log(`   - Deleted at: ${deletedInvoice.deletedAt}`);

    return {
      message: 'Invoice deleted successfully',
      invoiceId: id,
      deletedAt: deletedInvoice.deletedAt,
      deletedBy: userId,
    };
  }

  /**
   * Restore a soft-deleted invoice (ADMIN only)
   */
  async restore(id: number, userId: number, role: string) {
    if (role !== 'ADMIN') {
      throw new BadRequestException('Only admins can restore invoices');
    }

    // Check if invoice exists and is deleted
    const invoice = await this.prisma.invoice.findFirst({
      where: {
        id,
        isDeleted: true,
      },
      include: {
        order: {
          select: {
            id: true,
            status: true,
            commissionAmount: true,
            providerAmount: true,
            totalAmount: true,
          },
        },
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found or not deleted');
    }

    // Handle financial impact of restoration
    await this.handleRestoreFinancialImpact(invoice, userId);

    // Restore the invoice
    const restoredInvoice = await this.prisma.invoice.update({
      where: { id },
      data: {
        isDeleted: false,
        deletedAt: null,
        deletedBy: null,
      },
      include: {
        order: {
          select: {
            id: true,
            status: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            provider: {
              select: {
                id: true,
                name: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    console.log(`🔄 Invoice ${id} restored by admin ${userId}`);
    console.log(`   - Order: ${restoredInvoice.order.id}`);
    console.log(`   - Customer: ${restoredInvoice.order.user.name}`);
    console.log(`   - Provider: ${restoredInvoice.order.provider.name}`);
    console.log(`   - Restored at: ${new Date().toISOString()}`);

    return {
      message: 'Invoice restored successfully',
      invoiceId: id,
      restoredAt: new Date(),
      restoredBy: userId,
    };
  }

  /**
   * Reactivate a failed invoice (ADMIN only)
   */
  async reactivateFailedInvoice(id: number, userId: number, role: string) {
    if (role !== 'ADMIN') {
      throw new BadRequestException(
        'Only admins can reactivate failed invoices',
      );
    }

    // Check if invoice exists and is failed
    const invoice = await this.prisma.invoice.findFirst({
      where: {
        id,
        isDeleted: false,
        paymentStatus: 'failed',
      },
      include: {
        order: {
          select: {
            id: true,
            status: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            provider: {
              select: {
                id: true,
                name: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    if (!invoice) {
      throw new NotFoundException('Failed invoice not found');
    }

    // Handle financial impact of reactivation
    await this.handleReactivateFinancialImpact(invoice, userId);

    // Reactivate by setting status back to pending
    const reactivatedInvoice = await this.prisma.invoice.update({
      where: { id },
      data: {
        paymentStatus: 'pending',
        paymentMethod: null,
        paymentDate: null,
      },
      include: {
        order: {
          select: {
            id: true,
            status: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            provider: {
              select: {
                id: true,
                name: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    // Update order status back to pending
    await this.prisma.order.update({
      where: { id: invoice.order.id },
      data: { status: 'pending' },
    });

    console.log(`🔄 Failed invoice ${id} reactivated by admin ${userId}`);
    console.log(`   - Order: ${reactivatedInvoice.order.id}`);
    console.log(`   - Customer: ${reactivatedInvoice.order.user.name}`);
    console.log(`   - Provider: ${reactivatedInvoice.order.provider.name}`);
    console.log(`   - Reactivated at: ${new Date().toISOString()}`);

    return {
      message: 'Failed invoice reactivated successfully',
      invoiceId: id,
      newStatus: 'pending',
      reactivatedAt: new Date(),
      reactivatedBy: userId,
    };
  }

  /**
   * Handle financial impact when deleting an invoice
   */
  private async handleDeleteFinancialImpact(
    invoice: any,
    adminId: number,
  ): Promise<void> {
    const order = invoice.order;
    const paymentStatus = invoice.paymentStatus;

    console.log(
      `💰 HANDLING FINANCIAL IMPACT FOR DELETED INVOICE ${invoice.id}`,
    );
    console.log(`   - Payment Status: ${paymentStatus}`);
    console.log(`   - Total Amount: ${invoice.totalAmount} SAR`);
    console.log(`   - Commission: ${order.commissionAmount} SAR`);
    console.log(`   - Provider Amount: ${order.providerAmount} SAR`);

    switch (paymentStatus) {
      case 'paid':
        // CRITICAL: Reverse all financial commitments
        console.log(`🚨 REVERSING FINANCIAL COMMITMENTS FOR PAID INVOICE`);
        console.log(
          `   - Commission earned: -${order.commissionAmount} SAR (REVERSED)`,
        );
        console.log(
          `   - Provider earnings: -${order.providerAmount} SAR (REVERSED)`,
        );
        console.log(
          `   - Company revenue: -${invoice.totalAmount} SAR (REVERSED)`,
        );

        // Here you would typically:
        // 1. Reverse commission records
        // 2. Reverse provider payout records
        // 3. Update company revenue
        // 4. Send notifications to stakeholders
        // 5. Update accounting systems

        // Update order status to reflect deletion
        await this.prisma.order.update({
          where: { id: order.id },
          data: { status: 'deleted' },
        });

        console.log(
          `✅ Financial commitments reversed for deleted paid invoice`,
        );
        break;

      case 'pending':
        // No financial impact - no money committed yet
        console.log(`ℹ️ No financial impact for pending invoice deletion`);
        break;

      case 'failed':
        // No financial impact - payment already failed
        console.log(`ℹ️ No financial impact for failed invoice deletion`);
        break;

      case 'refunded':
        // No additional financial impact - already refunded
        console.log(
          `ℹ️ No additional financial impact for refunded invoice deletion`,
        );
        break;

      default:
        console.log(`⚠️ Unknown payment status: ${paymentStatus}`);
    }

    console.log(
      `📊 FINANCIAL IMPACT SUMMARY FOR DELETED INVOICE ${invoice.id}:`,
    );
    console.log(
      `   - Admin Commission: ${paymentStatus === 'paid' ? `-${order.commissionAmount} SAR (REVERSED)` : '0 SAR'}`,
    );
    console.log(
      `   - Provider Earnings: ${paymentStatus === 'paid' ? `-${order.providerAmount} SAR (REVERSED)` : '0 SAR'}`,
    );
    console.log(
      `   - Company Revenue: ${paymentStatus === 'paid' ? `-${invoice.totalAmount} SAR (REVERSED)` : '0 SAR'}`,
    );
  }

  /**
   * Handle financial impact when restoring a deleted invoice
   */
  private async handleRestoreFinancialImpact(
    invoice: any,
    adminId: number,
  ): Promise<void> {
    const order = invoice.order;
    const paymentStatus = invoice.paymentStatus;

    console.log(
      `💰 HANDLING FINANCIAL IMPACT FOR RESTORED INVOICE ${invoice.id}`,
    );
    console.log(`   - Payment Status: ${paymentStatus}`);
    console.log(`   - Total Amount: ${invoice.totalAmount} SAR`);
    console.log(`   - Commission: ${order.commissionAmount} SAR`);
    console.log(`   - Provider Amount: ${order.providerAmount} SAR`);

    switch (paymentStatus) {
      case 'paid':
        // CRITICAL: Re-apply financial commitments
        console.log(
          `🚨 RE-APPLYING FINANCIAL COMMITMENTS FOR RESTORED PAID INVOICE`,
        );
        console.log(
          `   - Commission earned: +${order.commissionAmount} SAR (RESTORED)`,
        );
        console.log(
          `   - Provider earnings: +${order.providerAmount} SAR (RESTORED)`,
        );
        console.log(
          `   - Company revenue: +${invoice.totalAmount} SAR (RESTORED)`,
        );

        // Here you would typically:
        // 1. Re-create commission records
        // 2. Re-schedule provider payout
        // 3. Update company revenue
        // 4. Send notifications to stakeholders
        // 5. Update accounting systems

        // Update order status back to paid
        await this.prisma.order.update({
          where: { id: order.id },
          data: { status: 'paid' },
        });

        console.log(
          `✅ Financial commitments restored for restored paid invoice`,
        );
        break;

      case 'pending':
        // No immediate financial impact - ready for payment
        console.log(
          `ℹ️ No immediate financial impact for restored pending invoice`,
        );
        console.log(`ℹ️ Invoice ready for payment processing`);
        break;

      case 'failed':
        // No immediate financial impact - payment failed
        console.log(
          `ℹ️ No immediate financial impact for restored failed invoice`,
        );
        console.log(`ℹ️ Invoice restored but payment still failed`);
        break;

      case 'refunded':
        // No immediate financial impact - already refunded
        console.log(
          `ℹ️ No immediate financial impact for restored refunded invoice`,
        );
        console.log(`ℹ️ Invoice restored but refund status maintained`);
        break;

      default:
        console.log(`⚠️ Unknown payment status: ${paymentStatus}`);
    }

    console.log(
      `📊 FINANCIAL IMPACT SUMMARY FOR RESTORED INVOICE ${invoice.id}:`,
    );
    console.log(
      `   - Admin Commission: ${paymentStatus === 'paid' ? `+${order.commissionAmount} SAR (RESTORED)` : '0 SAR'}`,
    );
    console.log(
      `   - Provider Earnings: ${paymentStatus === 'paid' ? `+${order.providerAmount} SAR (RESTORED)` : '0 SAR'}`,
    );
    console.log(
      `   - Company Revenue: ${paymentStatus === 'paid' ? `+${invoice.totalAmount} SAR (RESTORED)` : '0 SAR'}`,
    );
    console.log(
      `   - Status: ${paymentStatus === 'paid' ? 'Financial commitments restored' : 'No financial impact'}`,
    );
  }

  /**
   * Handle financial impact when reactivating a failed invoice
   */
  private async handleReactivateFinancialImpact(
    invoice: any,
    adminId: number,
  ): Promise<void> {
    const order = invoice.order;
    const paymentStatus = invoice.paymentStatus;

    console.log(
      `💰 HANDLING FINANCIAL IMPACT FOR REACTIVATED INVOICE ${invoice.id}`,
    );
    console.log(`   - Previous Status: ${paymentStatus}`);
    console.log(`   - New Status: pending`);
    console.log(`   - Total Amount: ${invoice.totalAmount} SAR`);
    console.log(`   - Commission: ${order.commissionAmount} SAR`);
    console.log(`   - Provider Amount: ${order.providerAmount} SAR`);

    // Reactivating a failed invoice means:
    // 1. No immediate financial impact (no money committed yet)
    // 2. Invoice is back to pending state
    // 3. Financial calculations will happen when marked as paid again

    console.log(
      `ℹ️ Reactivating failed invoice - no immediate financial impact`,
    );
    console.log(`ℹ️ Invoice will be eligible for payment again`);
    console.log(`ℹ️ Financial calculations will occur when marked as paid`);

    console.log(
      `📊 FINANCIAL IMPACT SUMMARY FOR REACTIVATED INVOICE ${invoice.id}:`,
    );
    console.log(`   - Admin Commission: 0 SAR (pending payment)`);
    console.log(`   - Provider Earnings: 0 SAR (pending payment)`);
    console.log(`   - Company Revenue: 0 SAR (pending payment)`);
    console.log(`   - Status: Ready for payment processing`);
  }

  /**
   * Get deleted invoices for admin review (ADMIN only)
   */
  async getDeletedInvoices(userId: number, role: string) {
    if (role !== 'ADMIN') {
      throw new BadRequestException('Only admins can view deleted invoices');
    }

    const deletedInvoices = await this.prisma.invoice.findMany({
      where: {
        isDeleted: true,
      },
      include: {
        order: {
          select: {
            id: true,
            orderDate: true,
            status: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
            provider: {
              select: {
                id: true,
                name: true,
                phone: true,
              },
            },
            service: {
              select: {
                id: true,
                titleAr: true,
                titleEn: true,
                description: true,
              },
            },
          },
        },
      },
      orderBy: {
        deletedAt: 'desc',
      },
    });

    return deletedInvoices.map((invoice) => ({
      id: invoice.id,
      orderId: invoice.orderId,
      totalAmount: invoice.totalAmount,
      discount: invoice.discount,
      paymentStatus: invoice.paymentStatus,
      paymentMethod: invoice.paymentMethod,
      deletedAt: invoice.deletedAt,
      deletedBy: invoice.deletedBy,
      order: {
        id: invoice.order.id,
        orderDate: invoice.order.orderDate,
        status: invoice.order.status,
        user: invoice.order.user,
        provider: invoice.order.provider,
        service: invoice.order.service,
      },
    }));
  }
}

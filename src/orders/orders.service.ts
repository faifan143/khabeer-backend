import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { UpdateOrderStatusDto, OrderStatus } from './dto/order-status.dto';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) { }

  async create(createOrderDto: CreateOrderDto, userId: number) {
    // Validate provider and service exist
    const provider = await this.prisma.provider.findUnique({
      where: { id: createOrderDto.providerId },
      include: { providerServices: true }
    });

    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    if (!provider.isActive) {
      throw new BadRequestException('Provider is not active');
    }

    const service = await this.prisma.service.findUnique({
      where: { id: createOrderDto.serviceId }
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    // Check if provider offers this service
    const providerService = provider.providerServices.find(
      ps => ps.serviceId === createOrderDto.serviceId && ps.isActive
    );

    if (!providerService) {
      throw new BadRequestException('Provider does not offer this service');
    }

    // Check for valid offers
    const now = new Date();
    const validOffer = await this.prisma.offer.findFirst({
      where: {
        providerId: createOrderDto.providerId,
        serviceId: createOrderDto.serviceId,
        isActive: true,
        startDate: { lte: now },
        endDate: { gt: now }
      },
      orderBy: {
        offerPrice: 'asc' // Get the best (lowest) offer price
      }
    });

    // Calculate amounts
    const providerPrice = providerService.price;
    const commission = service.commission;
    const quantity = createOrderDto.quantity || 1;

    // Use offer price if available, otherwise use regular price
    const finalProviderPrice = validOffer ? validOffer.offerPrice : providerPrice;
    const originalPrice = providerPrice;
    const discount = validOffer ? (originalPrice - finalProviderPrice) * quantity : 0;

    const providerAmount = finalProviderPrice * quantity;
    const commissionAmount = commission * quantity;
    const totalAmount = providerAmount + commissionAmount;

    // Create order
    const order = await this.prisma.order.create({
      data: {
        userId,
        providerId: createOrderDto.providerId,
        serviceId: createOrderDto.serviceId,
        scheduledDate: createOrderDto.scheduledDate ? new Date(createOrderDto.scheduledDate) : null,
        location: createOrderDto.location,
        locationDetails: createOrderDto.locationDetails,
        providerLocation: createOrderDto.providerLocation,
        quantity,
        totalAmount,
        providerAmount,
        commissionAmount,
        status: OrderStatus.PENDING
      },
      include: {
        user: true,
        provider: true,
        service: true,
        invoice: true
      }
    });

    // Create invoice with discount information
    await this.prisma.invoice.create({
      data: {
        orderId: order.id,
        totalAmount: order.totalAmount,
        discount: discount,
        paymentStatus: 'pending'
      }
    });

    // Add offer information to response if offer was applied
    const orderWithOffer = {
      ...order,
      appliedOffer: validOffer ? {
        id: validOffer.id,
        title: validOffer.description,
        originalPrice: originalPrice,
        offerPrice: finalProviderPrice,
        discount: discount,
        savings: discount
      } : null
    };

    return orderWithOffer;
  }

  async findAll(userId: number, role: string) {
    const where = role === 'PROVIDER'
      ? { providerId: userId }
      : { userId };

    return this.prisma.order.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true
          }
        },
        provider: {
          select: {
            id: true,
            name: true,
            phone: true,
            image: true
          }
        },
        service: {
          select: {
            id: true,
            title: true,
            description: true,
            image: true
          }
        },
        invoice: true
      },
      orderBy: {
        orderDate: 'desc'
      }
    });
  }

  async findOne(id: number, userId: number, role: string) {
    const where = role === 'PROVIDER'
      ? { id, providerId: userId }
      : { id, userId };

    const order = await this.prisma.order.findFirst({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            address: true
          }
        },
        provider: {
          select: {
            id: true,
            name: true,
            phone: true,
            image: true,
            description: true
          }
        },
        service: {
          select: {
            id: true,
            title: true,
            description: true,
            image: true,
            commission: true
          }
        },
        invoice: true
      }
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async updateStatus(id: number, updateStatusDto: UpdateOrderStatusDto, userId: number, role: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { provider: true }
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Validate permissions
    if (role === 'PROVIDER' && order.providerId !== userId) {
      throw new ForbiddenException('You can only update your own orders');
    }

    if (role === 'USER' && order.userId !== userId) {
      throw new ForbiddenException('You can only update your own orders');
    }

    // Validate status transitions
    const validTransitions = this.getValidStatusTransitions(order.status, role);
    if (!validTransitions.includes(updateStatusDto.status)) {
      throw new BadRequestException(`Invalid status transition from ${order.status} to ${updateStatusDto.status}`);
    }

    const updateData: any = {
      status: updateStatusDto.status
    };

    // Update provider location if provided
    if (updateStatusDto.providerLocation && role === 'PROVIDER') {
      updateData.providerLocation = updateStatusDto.providerLocation;
    }

    // Note: Payment status is managed separately by users/admins
    // Order completion does not automatically mark invoice as paid

    return this.prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true
          }
        },
        provider: {
          select: {
            id: true,
            name: true,
            phone: true,
            image: true
          }
        },
        service: {
          select: {
            id: true,
            title: true,
            description: true,
            image: true
          }
        },
        invoice: true
      }
    });
  }

  async cancel(id: number, userId: number, role: string) {
    const order = await this.prisma.order.findUnique({
      where: { id }
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Validate permissions
    if (role === 'PROVIDER' && order.providerId !== userId) {
      throw new ForbiddenException('You can only cancel your own orders');
    }

    if (role === 'USER' && order.userId !== userId) {
      throw new ForbiddenException('You can only cancel your own orders');
    }

    // Only allow cancellation if order is pending or accepted
    if (!['pending', 'accepted'].includes(order.status)) {
      throw new BadRequestException('Order cannot be cancelled in current status');
    }

    return this.prisma.order.update({
      where: { id },
      data: { status: OrderStatus.CANCELLED },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true
          }
        },
        provider: {
          select: {
            id: true,
            name: true,
            phone: true,
            image: true
          }
        },
        service: {
          select: {
            id: true,
            title: true,
            description: true,
            image: true
          }
        },
        invoice: true
      }
    });
  }

  async getOrderStats(userId: number, role: string) {
    const where = role === 'PROVIDER'
      ? { providerId: userId }
      : { userId };

    const [total, pending, accepted, inProgress, completed, cancelled] = await Promise.all([
      this.prisma.order.count({ where }),
      this.prisma.order.count({ where: { ...where, status: OrderStatus.PENDING } }),
      this.prisma.order.count({ where: { ...where, status: OrderStatus.ACCEPTED } }),
      this.prisma.order.count({ where: { ...where, status: OrderStatus.IN_PROGRESS } }),
      this.prisma.order.count({ where: { ...where, status: OrderStatus.COMPLETED } }),
      this.prisma.order.count({ where: { ...where, status: OrderStatus.CANCELLED } })
    ]);

    const totalRevenue = await this.prisma.order.aggregate({
      where: { ...where, status: OrderStatus.COMPLETED },
      _sum: { totalAmount: true }
    });

    return {
      total,
      pending,
      accepted,
      inProgress,
      completed,
      cancelled,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }

  async getOrderHistory(userId: number, role: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const where = role === 'PROVIDER'
      ? { providerId: userId }
      : { userId };

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              phone: true,
              email: true
            }
          },
          provider: {
            select: {
              id: true,
              name: true,
              phone: true,
              email: true
            }
          },
          service: true,
          invoice: true
        },
        orderBy: { orderDate: 'desc' },
        skip,
        take: limit
      }),
      this.prisma.order.count({ where })
    ]);

    return {
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    };
  }

  async getOrderAnalytics(userId: number, role: string, startDate?: Date, endDate?: Date) {
    const baseWhere = role === 'PROVIDER'
      ? { providerId: userId }
      : { userId };

    const where = {
      ...baseWhere,
      ...(startDate || endDate ? {
        orderDate: {
          ...(startDate ? { gte: startDate } : {}),
          ...(endDate ? { lte: endDate } : {})
        }
      } : {})
    };

    const orders = await this.prisma.order.findMany({
      where,
      include: {
        service: true,
        invoice: true
      },
      orderBy: { orderDate: 'asc' }
    });

    // Monthly analytics
    const monthlyData = this.calculateMonthlyAnalytics(orders);

    // Service analytics
    const serviceAnalytics = this.calculateServiceAnalytics(orders);

    // Status analytics
    const statusAnalytics = this.calculateStatusAnalytics(orders);

    return {
      monthlyData,
      serviceAnalytics,
      statusAnalytics,
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, order) => sum + order.totalAmount, 0),
      averageOrderValue: orders.length > 0 ? orders.reduce((sum, order) => sum + order.totalAmount, 0) / orders.length : 0
    };
  }

  async bulkUpdateStatus(orderIds: number[], status: OrderStatus, userId: number, role: string) {
    if (role !== 'PROVIDER') {
      throw new ForbiddenException('Only providers can perform bulk updates');
    }

    const orders = await this.prisma.order.findMany({
      where: {
        id: { in: orderIds },
        providerId: userId
      }
    });

    if (orders.length !== orderIds.length) {
      throw new BadRequestException('Some orders not found or not accessible');
    }

    const updatePromises = orders.map(order => {
      const validTransitions = this.getValidStatusTransitions(order.status, role);
      if (!validTransitions.includes(status)) {
        throw new BadRequestException(`Invalid status transition from ${order.status} to ${status}`);
      }

      return this.prisma.order.update({
        where: { id: order.id },
        data: { status }
      });
    });

    await Promise.all(updatePromises);

    return { message: `Successfully updated ${orders.length} orders to ${status}` };
  }

  async getOrdersByDateRange(userId: number, role: string, startDate: Date, endDate: Date) {
    const baseWhere = role === 'PROVIDER'
      ? { providerId: userId }
      : { userId };

    const where = {
      ...baseWhere,
      orderDate: {
        gte: startDate,
        lte: endDate
      }
    };

    return this.prisma.order.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true
          }
        },
        provider: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true
          }
        },
        service: true,
        invoice: true
      },
      orderBy: { orderDate: 'desc' }
    });
  }

  async getOrdersByStatus(userId: number, role: string, status: OrderStatus) {
    const baseWhere = role === 'PROVIDER'
      ? { providerId: userId }
      : { userId };

    const where = {
      ...baseWhere,
      status
    };

    return this.prisma.order.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true
          }
        },
        provider: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true
          }
        },
        service: true,
        invoice: true
      },
      orderBy: { orderDate: 'desc' }
    });
  }

  async getUpcomingOrders(userId: number, role: string) {
    const baseWhere = role === 'PROVIDER'
      ? { providerId: userId }
      : { userId };

    const where = {
      ...baseWhere,
      scheduledDate: {
        gte: new Date()
      },
      status: {
        in: [OrderStatus.PENDING, OrderStatus.ACCEPTED]
      }
    };

    return this.prisma.order.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true
          }
        },
        provider: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true
          }
        },
        service: true,
        invoice: true
      },
      orderBy: { scheduledDate: 'asc' }
    });
  }

  async getOverdueOrders(userId: number, role: string) {
    const baseWhere = role === 'PROVIDER'
      ? { providerId: userId }
      : { userId };

    const where = {
      ...baseWhere,
      scheduledDate: {
        lt: new Date()
      },
      status: {
        in: [OrderStatus.ACCEPTED, OrderStatus.IN_PROGRESS]
      }
    };

    return this.prisma.order.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true
          }
        },
        provider: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true
          }
        },
        service: true,
        invoice: true
      },
      orderBy: { scheduledDate: 'asc' }
    });
  }

  private calculateMonthlyAnalytics(orders: any[]): any[] {
    const monthlyData = {};

    orders.forEach(order => {
      const month = order.orderDate.toISOString().substring(0, 7); // YYYY-MM format
      if (!monthlyData[month]) {
        monthlyData[month] = {
          month,
          orders: 0,
          revenue: 0
        };
      }
      monthlyData[month].orders++;
      monthlyData[month].revenue += order.totalAmount;
    });

    return Object.values(monthlyData).sort((a: any, b: any) => a.month.localeCompare(b.month));
  }

  private calculateServiceAnalytics(orders: any[]): any[] {
    const serviceData = {};

    orders.forEach(order => {
      const serviceName = order.service.title;
      if (!serviceData[serviceName]) {
        serviceData[serviceName] = {
          service: serviceName,
          orders: 0,
          revenue: 0
        };
      }
      serviceData[serviceName].orders++;
      serviceData[serviceName].revenue += order.totalAmount;
    });

    return Object.values(serviceData).sort((a: any, b: any) => b.orders - a.orders);
  }

  private calculateStatusAnalytics(orders: any[]): any[] {
    const statusData = {};

    orders.forEach(order => {
      const status = order.status;
      if (!statusData[status]) {
        statusData[status] = {
          status,
          count: 0,
          percentage: 0
        };
      }
      statusData[status].count++;
    });

    const total = orders.length;
    Object.values(statusData).forEach((item: any) => {
      item.percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;
    });

    return Object.values(statusData);
  }

  private getValidStatusTransitions(currentStatus: string, role: string): OrderStatus[] {
    const transitions = {
      [OrderStatus.PENDING]: role === 'PROVIDER'
        ? [OrderStatus.ACCEPTED, OrderStatus.CANCELLED]
        : [OrderStatus.CANCELLED],
      [OrderStatus.ACCEPTED]: role === 'PROVIDER'
        ? [OrderStatus.IN_PROGRESS, OrderStatus.COMPLETED, OrderStatus.CANCELLED]
        : [OrderStatus.CANCELLED],
      [OrderStatus.IN_PROGRESS]: role === 'PROVIDER'
        ? [OrderStatus.COMPLETED, OrderStatus.CANCELLED]
        : [],
      [OrderStatus.COMPLETED]: [],
      [OrderStatus.CANCELLED]: []
    };

    return transitions[currentStatus] || [];
  }
}

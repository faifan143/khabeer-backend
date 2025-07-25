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

    // Calculate amounts
    const providerPrice = providerService.price;
    const commission = service.commission;
    const quantity = createOrderDto.quantity || 1;

    const providerAmount = providerPrice * quantity;
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

    // Create invoice
    await this.prisma.invoice.create({
      data: {
        orderId: order.id,
        totalAmount: order.totalAmount,
        discount: 0,
        paymentStatus: 'pending'
      }
    });

    return order;
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

    // Update payment status when order is completed
    if (updateStatusDto.status === OrderStatus.COMPLETED) {
      await this.prisma.invoice.update({
        where: { orderId: id },
        data: { paymentStatus: 'paid' }
      });
    }

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

    const [total, pending, completed, cancelled] = await Promise.all([
      this.prisma.order.count({ where }),
      this.prisma.order.count({ where: { ...where, status: 'pending' } }),
      this.prisma.order.count({ where: { ...where, status: 'completed' } }),
      this.prisma.order.count({ where: { ...where, status: 'cancelled' } })
    ]);

    return {
      total,
      pending,
      completed,
      cancelled,
      active: total - completed - cancelled
    };
  }

  private getValidStatusTransitions(currentStatus: string, role: string): OrderStatus[] {
    const transitions = {
      pending: role === 'PROVIDER'
        ? [OrderStatus.ACCEPTED, OrderStatus.CANCELLED]
        : [OrderStatus.CANCELLED],
      accepted: role === 'PROVIDER'
        ? [OrderStatus.IN_PROGRESS, OrderStatus.CANCELLED]
        : [OrderStatus.CANCELLED],
      in_progress: role === 'PROVIDER'
        ? [OrderStatus.COMPLETED]
        : [],
      completed: [],
      cancelled: []
    };

    return transitions[currentStatus] || [];
  }
}

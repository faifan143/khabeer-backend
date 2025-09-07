import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) { }

  async findAll(serviceType?: string) {
    const where: any = {};
    if (serviceType) {
      where.serviceType = serviceType;
    }
    return this.prisma.service.findMany({
      where,
      include: {
        category: true
      }
    });
  }

  async findByCategory(categoryId: number) {
    return this.prisma.service.findMany({
      where: {
        categoryId,
        serviceType: 'NORMAL' // Only normal services can be in categories
      },
      include: {
        category: true
      }
    });
  }

  async findById(id: number) {
    return this.prisma.service.findUnique({ where: { id } });
  }

  async create(data: CreateServiceDto & { image: string }) {
    // Validate service type constraints
    this.validateServiceTypeConstraints(data);

    return this.prisma.service.create({ data });
  }

  async update(id: number, data: UpdateServiceDto & { image?: string }) {
    // Validate service type constraints
    this.validateServiceTypeConstraints(data);

    return this.prisma.service.update({ where: { id }, data });
  }

  async remove(id: number) {
    // Use a transaction to handle cascade deletion properly
    return this.prisma.$transaction(async (tx) => {
      // First, delete all related invoices (they reference orders)
      await tx.invoice.deleteMany({
        where: {
          order: {
            serviceId: id
          }
        }
      });

      // Then delete all related orders
      await tx.order.deleteMany({
        where: { serviceId: id }
      });

      // Then delete all related provider services
      await tx.providerService.deleteMany({
        where: { serviceId: id }
      });

      // Then delete all related offers
      await tx.offer.deleteMany({
        where: { serviceId: id }
      });

      // Finally delete the service
      return tx.service.delete({
        where: { id }
      });
    });
  }

  // Validation method for service type constraints
  private validateServiceTypeConstraints(data: any) {
    const serviceType = data.serviceType || 'NORMAL';
    const categoryId = data.categoryId;
    const commission = data.commission;

    if (serviceType === 'NORMAL') {
      if (!categoryId) {
        throw new BadRequestException('NORMAL services require a categoryId');
      }
      if (commission === undefined || commission === null) {
        throw new BadRequestException('NORMAL services require a commission');
      }
    }

    if (serviceType === 'KHABEER') {
      if (categoryId !== undefined && categoryId !== null) {
        throw new BadRequestException('KHABEER services cannot have a categoryId');
      }
      // Commission is optional for Khabeer services
    }
  }

  // Get only normal services (for provider assignment)
  async findNormalServices() {
    return this.prisma.service.findMany({
      where: { serviceType: 'NORMAL' },
      include: {
        category: true
      }
    });
  }

  // Get only Khabeer services (for direct contact)
  async findKhabeerServices() {
    return this.prisma.service.findMany({
      where: { serviceType: 'KHABEER' }
    });
  }

  // Check if service can be assigned to providers
  async canBeAssignedToProviders(serviceId: number): Promise<boolean> {
    const service = await this.prisma.service.findUnique({
      where: { id: serviceId },
      select: { serviceType: true }
    });

    return service?.serviceType === 'NORMAL';
  }

  // Check if service can be ordered
  async canBeOrdered(serviceId: number): Promise<boolean> {
    const service = await this.prisma.service.findUnique({
      where: { id: serviceId },
      select: { serviceType: true }
    });

    return service?.serviceType === 'NORMAL';
  }
}

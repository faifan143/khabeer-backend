import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) { }

  async findAll(userState?: string, userRole?: string, userId?: number) {
    const where: any = {};

    // For providers, filter by their registered categories
    if (userRole === 'PROVIDER' && userId) {
      const providerCategories = await this.prisma.providerCategory.findMany({
        where: {
          providerId: userId,
          isActive: true
        },
        select: { categoryId: true }
      });

      const categoryIds = providerCategories.map(pc => pc.categoryId);

      if (categoryIds.length > 0) {
        where.categoryId = { in: categoryIds };
      } else {
        // If provider has no categories, return empty array
        where.id = { in: [] };
      }
    }

    // For state filtering, check category's state
    if (userState && userState !== 'undefined' && userRole !== 'ADMIN') {
      where.category = {
        state: userState
      };
    }

    // For non-providers, filter out services from inactive/offline providers
    if (userRole !== 'ADMIN' && userRole !== 'PROVIDER') {
      where.providerServices = {
        some: {
          provider: {
            isActive: true,
            onlineStatus: true
          }
        }
      };
    }

    return this.prisma.service.findMany({
      where,
      include: {
        category: true
      }
    });
  }

  async findByCategory(categoryId: number, userState?: string, userRole?: string) {
    const where: any = {
      categoryId
    };

    // Skip provider filtering for admins
    if (userRole !== 'ADMIN') {
      // Always filter out services from inactive/offline providers
      where.providerServices = {
        some: {
          provider: {
            isActive: true,
            onlineStatus: true
          }
        }
      };
    }

    // For services in categories, we check the category's state
    if (userState && userState !== 'undefined' && userRole !== 'ADMIN') {
      where.category = {
        id: categoryId,
        state: userState
      };
    }

    return this.prisma.service.findMany({
      where,
      include: {
        category: true
      }
    });
  }

  async findById(id: number) {
    return this.prisma.service.findUnique({
      where: { id },
      include: {
        category: true
      }
    });
  }

  async create(data: CreateServiceDto & { image: string }) {
    // Validate service type constraints
    this.validateServiceTypeConstraints(data);

    return this.prisma.service.create({
      data,
      include: {
        category: true
      }
    });
  }

  async update(id: number, data: UpdateServiceDto & { image?: string }) {
    // Validate service type constraints
    this.validateServiceTypeConstraints(data);

    return this.prisma.service.update({
      where: { id },
      data,
      include: {
        category: true
      }
    });
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
      if (!categoryId) {
        throw new BadRequestException('KHABEER services require a categoryId');
      }
      // Commission is optional for Khabeer services
    }
  }

  // Get all public services with full details and categories
  async findAllPublic() {
    return this.prisma.service.findMany({
      select: {
        id: true,
        titleAr: true,
        titleEn: true,
        description: true,
        image: true,
        commission: true,
        serviceType: true,
        category: {
          select: {
            id: true,
            titleAr: true,
            titleEn: true,
            image: true,
            state: true
          }
        }
      },
      orderBy: {
        id: 'asc'
      }
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
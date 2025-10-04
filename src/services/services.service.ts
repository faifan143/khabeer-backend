import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { CreateBulkServiceDto } from './dto/create-bulk-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userState?: string, userRole?: string, userId?: number) {
    const where: any = {};

    // For providers, filter by their registered categories
    if (userRole === 'PROVIDER' && userId) {
      const providerCategories = await this.prisma.providerCategory.findMany({
        where: {
          providerId: userId,
          isActive: true,
        },
        select: { categoryId: true },
      });

      const categoryIds = providerCategories.map((pc) => pc.categoryId);

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
        state: userState,
      };
    }

    // For non-providers, filter out services from inactive/offline providers
    if (userRole !== 'ADMIN' && userRole !== 'PROVIDER') {
      where.providerServices = {
        some: {
          provider: {
            isActive: true,
            onlineStatus: true,
          },
        },
      };
    }

    return this.prisma.service.findMany({
      where,
      include: {
        category: true,
      },
    });
  }

  async findByCategory(
    categoryId: number,
    userState?: string,
    userRole?: string,
  ) {
    const where: any = {};
    const andConditions: any[] = [];

    // Always filter by categoryId
    andConditions.push({ categoryId });

    // Conditional filtering for providers (only for non-admins and NORMAL services)
    if (userRole !== 'ADMIN') {
      andConditions.push({
        OR: [
          { serviceType: 'KHABEER' },
          {
            serviceType: 'NORMAL',
            providerServices: {
              some: {
                provider: {
                  isActive: true,
                  onlineStatus: true,
                },
              },
            },
          },
        ],
      });
    }

    // Conditional filtering for category state (only for non-admins with userState)
    if (userState && userState !== 'undefined' && userRole !== 'ADMIN') {
      // Modify the categoryId filter to include state
      const categoryIdConditionIndex = andConditions.findIndex(
        (condition) => condition.categoryId !== undefined,
      );
      if (categoryIdConditionIndex > -1) {
        // Replace the categoryId condition with the nested category condition
        andConditions[categoryIdConditionIndex] = {
          category: {
            AND: [{ id: categoryId }, { state: userState }],
          },
        };
      } else {
        // Fallback, though categoryId should always be pushed first
        andConditions.push({
          category: {
            AND: [{ id: categoryId }, { state: userState }],
          },
        });
      }
    }

    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    return this.prisma.service.findMany({
      where,
      include: {
        category: true,
      },
    });
  }

  async findById(id: number) {
    return this.prisma.service.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });
  }

  async create(data: CreateServiceDto & { image: string }) {
    // Validate service type constraints
    this.validateServiceTypeConstraints(data);

    return this.prisma.service.create({
      data,
      include: {
        category: true,
      },
    });
  }

  async createBulk(data: CreateBulkServiceDto & { image: string }) {
    // Validate service type constraints for each category
    for (const categoryId of data.categoryIds) {
      const serviceData = {
        ...data,
        categoryId,
      };
      this.validateServiceTypeConstraints(serviceData);
    }

    // Create services for each category
    const services = data.categoryIds.map((categoryId) => ({
      titleAr: data.titleAr,
      titleEn: data.titleEn,
      description: data.description,
      commission: data.commission,
      whatsapp: data.whatsapp,
      serviceType: data.serviceType || 'NORMAL',
      categoryId: parseInt(categoryId),
      image: data.image,
    }));

    // Use transaction to ensure all services are created or none
    return this.prisma.$transaction(async (tx) => {
      const createdServices: any[] = [];
      for (const serviceData of services) {
        const service = await tx.service.create({
          data: serviceData,
          include: {
            category: true,
          },
        });
        createdServices.push(service);
      }
      return createdServices;
    });
  }

  async update(id: number, data: UpdateServiceDto & { image?: string }) {
    // Validate service type constraints
    this.validateServiceTypeConstraints(data);

    return this.prisma.service.update({
      where: { id },
      data,
      include: {
        category: true,
      },
    });
  }

  async remove(id: number) {
    // Use a transaction to handle cascade deletion properly
    return this.prisma.$transaction(async (tx) => {
      // First, delete all related invoices (they reference orders)
      await tx.invoice.deleteMany({
        where: {
          order: {
            serviceId: id,
          },
        },
      });

      // Then delete all related orders
      await tx.order.deleteMany({
        where: { serviceId: id },
      });

      // Then delete all related provider services
      await tx.providerService.deleteMany({
        where: { serviceId: id },
      });

      // Then delete all related offers
      await tx.offer.deleteMany({
        where: { serviceId: id },
      });

      // Finally delete the service
      return tx.service.delete({
        where: { id },
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
            state: true,
          },
        },
      },
      orderBy: {
        id: 'asc',
      },
    });
  }

  // Check if service can be assigned to providers
  async canBeAssignedToProviders(serviceId: number): Promise<boolean> {
    const service = await this.prisma.service.findUnique({
      where: { id: serviceId },
      select: { serviceType: true },
    });

    return service?.serviceType === 'NORMAL';
  }

  // Check if service can be ordered
  async canBeOrdered(serviceId: number): Promise<boolean> {
    const service = await this.prisma.service.findUnique({
      where: { id: serviceId },
      select: { serviceType: true },
    });

    return service?.serviceType === 'NORMAL';
  }
}

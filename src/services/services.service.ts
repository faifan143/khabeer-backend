import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) { }

  async findAll(serviceType?: string, userState?: string, userRole?: string) {
    const where: any = {};
    if (serviceType) {
      where.serviceType = serviceType;
    }

    // For state filtering, we need different logic based on service type
    if (userState && userState !== 'undefined' && userRole !== 'ADMIN') {
      if (serviceType === 'KHABEER') {
        // For Khabeer services, check service's direct state (no provider filtering needed)
        where.state = userState;
      } else if (serviceType === 'NORMAL') {
        // For normal services, check category's state and provider status
        where.category = {
          state: userState
        };
        // Add provider filtering for normal services
        if (userRole !== 'ADMIN') {
          where.providerServices = {
            some: {
              provider: {
                isActive: true,
                onlineStatus: true
              }
            }
          };
        }
      } else {
        // When no serviceType specified, use OR condition for both types
        where.OR = [
          {
            // Normal services: check category's state and provider status
            serviceType: 'NORMAL',
            category: {
              state: userState
            },
            providerServices: {
              some: {
                provider: {
                  isActive: true,
                  onlineStatus: true
                }
              }
            }
          },
          {
            // Khabeer services: check service's direct state (no provider filtering)
            serviceType: 'KHABEER',
            state: userState
          }
        ];
      }
    } else {
      // When no state filtering, still apply provider filtering for normal services
      if (userRole !== 'ADMIN') {
        if (serviceType === 'NORMAL') {
          where.providerServices = {
            some: {
              provider: {
                isActive: true,
                onlineStatus: true
              }
            }
          };
        } else if (!serviceType) {
          // When no serviceType specified, only apply provider filtering to normal services
          where.OR = [
            {
              serviceType: 'NORMAL',
              providerServices: {
                some: {
                  provider: {
                    isActive: true,
                    onlineStatus: true
                  }
                }
              }
            },
            {
              serviceType: 'KHABEER'
            }
          ];
        }
      }
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
      categoryId,
      serviceType: 'NORMAL' // Only normal services can be in categories
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


  async findByKhabeer(userState?: string, userRole?: string) {
    const where: any = {
      serviceType: 'KHABEER'
    };

    // Khabeer services don't need provider filtering - they are direct services
    // For Khabeer services, check service's direct state
    if (userState && userState !== 'undefined' && userRole !== 'ADMIN') {
      where.state = userState;
    }
    return this.prisma.service.findMany({
      where,
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
  async findNormalServices(userState?: string, userRole?: string) {
    const where: any = { serviceType: 'NORMAL' };

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

    // For normal services, check the category's state
    if (userState && userState !== 'undefined' && userRole !== 'ADMIN') {
      where.category = {
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

  // Get only Khabeer services (for direct contact)
  async findKhabeerServices(userState?: string, userRole?: string) {
    const where: any = { serviceType: 'KHABEER' };

    // Khabeer services don't need provider filtering - they are direct services
    if (userState && userState !== 'undefined' && userRole !== 'ADMIN') {
      where.state = userState;
    }
    return this.prisma.service.findMany({ where });
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

  // Get all public services with full details and categories (excluding Khabeer services)
  async findAllPublic() {
    return this.prisma.service.findMany({
      where: {
        serviceType: 'NORMAL' // Only normal services, exclude Khabeer services
      },
      select: {
        id: true,
        title: true,
        description: true,
        image: true,
        commission: true,
        serviceType: true,
        state: true,
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
}

import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateProviderServiceDto {
  serviceId: number;
  price: number;
  isActive?: boolean;
}

export interface UpdateProviderServiceDto {
  price?: number;
  isActive?: boolean;
}

export interface AddServicesDto {
  services: Array<{
    serviceId: number;
    price: number;
    isActive?: boolean;
  }>;
}

@Injectable()
export class ProviderServiceService {
  constructor(private readonly prisma: PrismaService) { }

  async create(providerId: number, createProviderServiceDto: CreateProviderServiceDto) {
    const { serviceId, price, isActive = true } = createProviderServiceDto;

    // Validate price
    if (price <= 0) {
      throw new BadRequestException('Price must be greater than 0');
    }

    // Check if provider exists
    const provider = await this.prisma.provider.findUnique({
      where: { id: providerId }
    });

    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    // Check if service exists
    const service = await this.prisma.service.findUnique({
      where: { id: serviceId }
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    // Check if provider already offers this service
    const existingProviderService = await this.prisma.providerService.findFirst({
      where: {
        providerId,
        serviceId
      }
    });

    if (existingProviderService) {
      throw new BadRequestException('Provider already offers this service');
    }

    // Create provider service
    const providerService = await this.prisma.providerService.create({
      data: {
        providerId,
        serviceId,
        price,
        isActive
      },
      include: {
        service: {
          select: {
            id: true,
            title: true,
            description: true,
            image: true,
            commission: true
          }
        }
      }
    });

    return providerService;
  }

  async findAll(providerId?: number, activeOnly: boolean = false) {
    const where: any = {};

    if (providerId) {
      where.providerId = providerId;
    }

    if (activeOnly) {
      where.isActive = true;
    }

    const providerServices = await this.prisma.providerService.findMany({
      where,
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            image: true,
            isVerified: true,
            isActive: true
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
        }
      },
      orderBy: {
        service: {
          title: 'asc'
        }
      }
    });

    return providerServices;
  }

  async findByProvider(providerId: number, activeOnly: boolean = false) {
    const provider = await this.prisma.provider.findUnique({
      where: { id: providerId }
    });

    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    const where: any = { providerId };
    if (activeOnly) {
      where.isActive = true;
    }

    const providerServices = await this.prisma.providerService.findMany({
      where,
      include: {
        service: {
          select: {
            id: true,
            title: true,
            description: true,
            image: true,
            commission: true
          }
        }
      },
      orderBy: {
        service: {
          title: 'asc'
        }
      }
    });

    return providerServices;
  }

  async findOne(id: number) {
    const providerService = await this.prisma.providerService.findUnique({
      where: { id },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            image: true
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
        }
      }
    });

    if (!providerService) {
      throw new NotFoundException('Provider service not found');
    }

    return providerService;
  }

  async update(id: number, providerId: number, updateProviderServiceDto: UpdateProviderServiceDto) {
    const providerService = await this.prisma.providerService.findUnique({
      where: { id }
    });

    if (!providerService) {
      throw new NotFoundException('Provider service not found');
    }

    if (providerService.providerId !== providerId) {
      throw new ForbiddenException('You can only update your own services');
    }

    const { price, isActive } = updateProviderServiceDto;

    // Validate price if provided
    if (price !== undefined && price <= 0) {
      throw new BadRequestException('Price must be greater than 0');
    }

    const updatedProviderService = await this.prisma.providerService.update({
      where: { id },
      data: {
        ...(price !== undefined && { price }),
        ...(isActive !== undefined && { isActive })
      },
      include: {
        service: {
          select: {
            id: true,
            title: true,
            description: true,
            image: true,
            commission: true
          }
        }
      }
    });

    return updatedProviderService;
  }

  async remove(id: number, providerId: number) {
    const providerService = await this.prisma.providerService.findUnique({
      where: { id }
    });

    if (!providerService) {
      throw new NotFoundException('Provider service not found');
    }

    if (providerService.providerId !== providerId) {
      throw new ForbiddenException('You can only remove your own services');
    }

    // Check if there are any active orders for this service
    const activeOrders = await this.prisma.order.findFirst({
      where: {
        providerId,
        serviceId: providerService.serviceId,
        status: {
          in: ['pending', 'accepted', 'in_progress']
        }
      }
    });

    if (activeOrders) {
      throw new BadRequestException('Cannot remove service with active orders');
    }

    await this.prisma.providerService.delete({
      where: { id }
    });

    return { message: 'Provider service removed successfully' };
  }

  async addMultipleServices(providerId: number, addServicesDto: AddServicesDto) {
    const { services } = addServicesDto;

    if (!services || services.length === 0) {
      throw new BadRequestException('At least one service must be provided');
    }

    // Validate provider exists
    const provider = await this.prisma.provider.findUnique({
      where: { id: providerId }
    });

    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    // Validate all services exist
    const serviceIds = services.map(s => s.serviceId);
    const existingServices = await this.prisma.service.findMany({
      where: {
        id: { in: serviceIds }
      }
    });

    if (existingServices.length !== serviceIds.length) {
      throw new BadRequestException('One or more services not found');
    }

    // Check for existing provider services
    const existingProviderServices = await this.prisma.providerService.findMany({
      where: {
        providerId,
        serviceId: { in: serviceIds }
      }
    });

    const existingServiceIds = existingProviderServices.map(ps => ps.serviceId);
    const newServices = services.filter(s => !existingServiceIds.includes(s.serviceId));

    if (newServices.length === 0) {
      throw new BadRequestException('All services are already offered by this provider');
    }

    // Create new provider services
    const createdServices = await this.prisma.providerService.createMany({
      data: newServices.map(service => ({
        providerId,
        serviceId: service.serviceId,
        price: service.price,
        isActive: service.isActive !== false // Default to true
      }))
    });

    // Return the newly created services with full details
    const newProviderServices = await this.prisma.providerService.findMany({
      where: {
        providerId,
        serviceId: { in: newServices.map(s => s.serviceId) }
      },
      include: {
        service: {
          select: {
            id: true,
            title: true,
            description: true,
            image: true,
            commission: true
          }
        }
      }
    });

    return {
      message: `Added ${createdServices.count} new services`,
      services: newProviderServices
    };
  }

  async removeMultipleServices(providerId: number, serviceIds: number[]) {
    if (!serviceIds || serviceIds.length === 0) {
      throw new BadRequestException('At least one service ID must be provided');
    }

    // Check if provider exists
    const provider = await this.prisma.provider.findUnique({
      where: { id: providerId }
    });

    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    // Check for active orders
    const activeOrders = await this.prisma.order.findFirst({
      where: {
        providerId,
        serviceId: { in: serviceIds },
        status: {
          in: ['pending', 'accepted', 'in_progress']
        }
      }
    });

    if (activeOrders) {
      throw new BadRequestException('Cannot remove services with active orders');
    }

    // Remove provider services
    const result = await this.prisma.providerService.deleteMany({
      where: {
        providerId,
        serviceId: { in: serviceIds }
      }
    });

    return {
      message: `Removed ${result.count} services`,
      removedCount: result.count
    };
  }

  async toggleServiceStatus(id: number, providerId: number) {
    const providerService = await this.prisma.providerService.findUnique({
      where: { id }
    });

    if (!providerService) {
      throw new NotFoundException('Provider service not found');
    }

    if (providerService.providerId !== providerId) {
      throw new ForbiddenException('You can only update your own services');
    }

    const updatedProviderService = await this.prisma.providerService.update({
      where: { id },
      data: {
        isActive: !providerService.isActive
      },
      include: {
        service: {
          select: {
            id: true,
            title: true,
            description: true,
            image: true,
            commission: true
          }
        }
      }
    });

    return updatedProviderService;
  }

  async getServiceStats(providerId: number) {
    const provider = await this.prisma.provider.findUnique({
      where: { id: providerId }
    });

    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    const providerServices = await this.prisma.providerService.findMany({
      where: { providerId },
      include: {
        service: true
      }
    });

    const stats = {
      totalServices: providerServices.length,
      activeServices: providerServices.filter(ps => ps.isActive).length,
      inactiveServices: providerServices.filter(ps => !ps.isActive).length,
      averagePrice: providerServices.length > 0
        ? providerServices.reduce((sum, ps) => sum + ps.price, 0) / providerServices.length
        : 0,
      services: providerServices.map(ps => ({
        id: ps.id,
        serviceId: ps.serviceId,
        serviceTitle: ps.service.title,
        price: ps.price,
        isActive: ps.isActive
      }))
    };

    return stats;
  }
}

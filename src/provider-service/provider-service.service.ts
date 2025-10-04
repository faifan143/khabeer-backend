import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ServicesService } from '../services/services.service';

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

export interface ProviderServiceWithOfferResponse {
  id: number;
  providerId: number;
  serviceId: number;
  isActive: boolean;
  price: number;
  provider?: {
    id: number;
    name: string;
    image: string;
    isVerified?: boolean;
    isActive?: boolean;
  };
  service?: {
    id: number;
    titleAr: string;
    titleEn: string;
    description: string | null;
    image: string;
    commission: number | null;
  };
  activeOffer?: {
    id: number;
    startDate: Date;
    endDate: Date;
    description: string;
    offerPrice: number;
    originalPrice: number;
  } | null;
}

@Injectable()
export class ProviderServiceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly servicesService: ServicesService,
  ) {}

  private async getActiveOffer(providerId: number, serviceId: number) {
    const now = new Date();

    // Use the same date validation logic as all other offer endpoints
    const activeOffer = await this.prisma.offer.findFirst({
      where: {
        providerId,
        serviceId,
        isActive: true,
        startDate: { lte: now },
        endDate: { gt: now },
      },
      select: {
        id: true,
        startDate: true,
        endDate: true,
        description: true,
        offerPrice: true,
        originalPrice: true,
      },
      orderBy: {
        offerPrice: 'asc', // Get the best (lowest) offer price
      },
    });

    return activeOffer;
  }

  private async adjustOffersForService(
    providerId: number,
    serviceId: number,
    newPrice: number,
  ) {
    const activeOffers = await this.prisma.offer.findMany({
      where: {
        providerId,
        serviceId,
        isActive: true,
        endDate: { gt: new Date() },
      },
    });

    for (const offer of activeOffers) {
      const discountPercentage =
        (offer.originalPrice - offer.offerPrice) / offer.originalPrice;
      const newOfferPrice = newPrice * (1 - discountPercentage);

      if (newOfferPrice < newPrice) {
        // Update offer with new prices
        await this.prisma.offer.update({
          where: { id: offer.id },
          data: {
            originalPrice: newPrice,
            offerPrice: newOfferPrice,
          },
        });
      } else {
        // Deactivate offer if can't maintain valid discount
        await this.prisma.offer.update({
          where: { id: offer.id },
          data: { isActive: false },
        });
      }
    }
  }

  async create(
    providerId: number,
    createProviderServiceDto: CreateProviderServiceDto,
  ) {
    const { serviceId, price, isActive = true } = createProviderServiceDto;

    // Validate price
    if (price <= 0) {
      throw new BadRequestException('Price must be greater than 0');
    }

    // Check if service can be assigned to providers
    const canBeAssigned =
      await this.servicesService.canBeAssignedToProviders(serviceId);
    if (!canBeAssigned) {
      throw new BadRequestException(
        'This service cannot be assigned to providers',
      );
    }

    // Check if provider exists
    const provider = await this.prisma.provider.findUnique({
      where: { id: providerId },
    });

    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    // Check if service exists
    const service = await this.prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    // Check if provider already offers this service
    const existingProviderService = await this.prisma.providerService.findFirst(
      {
        where: {
          providerId,
          serviceId,
        },
      },
    );

    if (existingProviderService) {
      throw new BadRequestException('Provider already offers this service');
    }

    // Create provider service
    const providerService = await this.prisma.providerService.create({
      data: {
        providerId,
        serviceId,
        price,
        isActive,
      },
      include: {
        service: {
          select: {
            id: true,
            titleAr: true,
            titleEn: true,
            descriptionAr: true,
            descriptionEn: true,
            image: true,
            commission: true,
          },
        },
      },
    });

    return providerService;
  }

  /**
   * Find all provider services with optional filtering and active offer information
   * @param providerId - Optional provider ID to filter by
   * @param activeOnly - Whether to return only active services
   * @returns Array of provider services with active offer details if available
   */
  async findAll(
    providerId?: number,
    activeOnly: boolean = false,
    userRole?: string,
  ): Promise<ProviderServiceWithOfferResponse[]> {
    const where: any = {};

    if (providerId) {
      where.providerId = providerId;
    }

    if (activeOnly) {
      where.isActive = true;
    }

    // For providers, filter by their registered categories
    if (userRole === 'PROVIDER' && providerId) {
      const providerCategories = await this.prisma.providerCategory.findMany({
        where: {
          providerId: providerId,
          isActive: true,
        },
        select: { categoryId: true },
      });

      const categoryIds = providerCategories.map((pc) => pc.categoryId);

      if (categoryIds.length > 0) {
        where.service = {
          categoryId: { in: categoryIds },
        };
      } else {
        // If provider has no categories, return empty array
        where.id = { in: [] };
      }
    }

    console.log('where => ', where);

    const providerServices = await this.prisma.providerService.findMany({
      where,
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            image: true,
            isVerified: true,
            isActive: true,
          },
        },
        service: {
          select: {
            id: true,
            titleAr: true,
            titleEn: true,
            descriptionAr: true,
            descriptionEn: true,
            image: true,
            commission: true,
            categoryId: true,
          },
        },
      },
      orderBy: {
        service: {
          titleEn: 'asc',
        },
      },
    });

    // Get active offers for each provider service
    const providerServicesWithOffers = await Promise.all(
      providerServices.map(async (providerService) => {
        const activeOffer = await this.getActiveOffer(
          providerService.providerId,
          providerService.serviceId,
        );

        return {
          ...providerService,
          activeOffer: activeOffer || null,
        };
      }),
    );

    return providerServicesWithOffers;
  }

  /**
   * Find all services offered by a specific provider with active offer information
   * @param providerId - Provider ID to filter by
   * @param activeOnly - Whether to return only active services
   * @returns Array of provider services with active offer details if available
   */
  async findByProvider(
    providerId: number,
    activeOnly: boolean = false,
    userRole?: string,
  ): Promise<ProviderServiceWithOfferResponse[]> {
    const provider = await this.prisma.provider.findUnique({
      where: { id: providerId },
    });

    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    const where: any = { providerId };
    if (activeOnly) {
      where.isActive = true;
    }

    // For providers, filter by their registered categories
    if (userRole === 'PROVIDER') {
      const providerCategories = await this.prisma.providerCategory.findMany({
        where: {
          providerId: providerId,
          isActive: true,
        },
        select: { categoryId: true },
      });

      const categoryIds = providerCategories.map((pc) => pc.categoryId);

      if (categoryIds.length > 0) {
        where.service = {
          categoryId: { in: categoryIds },
        };
      } else {
        // If provider has no categories, return empty array
        where.id = { in: [] };
      }
    }

    const providerServices = await this.prisma.providerService.findMany({
      where,
      include: {
        service: {
          select: {
            id: true,
            titleAr: true,
            titleEn: true,
            descriptionAr: true,
            descriptionEn: true,
            image: true,
            commission: true,
            categoryId: true,
          },
        },
      },
      orderBy: {
        service: {
          titleEn: 'asc',
        },
      },
    });

    // Get active offers for each provider service
    const providerServicesWithOffers = await Promise.all(
      providerServices.map(async (providerService) => {
        const activeOffer = await this.getActiveOffer(
          providerService.providerId,
          providerService.serviceId,
        );

        return {
          ...providerService,
          activeOffer: activeOffer || null,
        };
      }),
    );

    return providerServicesWithOffers;
  }

  /**
   * Find a specific provider service by ID with active offer information
   * @param id - Provider service ID
   * @returns Provider service with active offer details if available
   */
  async findOne(id: number): Promise<ProviderServiceWithOfferResponse> {
    const providerService = await this.prisma.providerService.findUnique({
      where: { id },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        service: {
          select: {
            id: true,
            titleAr: true,
            titleEn: true,
            descriptionAr: true,
            descriptionEn: true,
            image: true,
            commission: true,
          },
        },
      },
    });

    if (!providerService) {
      throw new NotFoundException('Provider service not found');
    }

    // Get active offer for this provider service
    const activeOffer = await this.getActiveOffer(
      providerService.providerId,
      providerService.serviceId,
    );

    return {
      ...providerService,
      activeOffer: activeOffer || null,
    };
  }

  async update(
    id: number,
    providerId: number,
    updateProviderServiceDto: UpdateProviderServiceDto,
  ): Promise<ProviderServiceWithOfferResponse> {
    const providerService = await this.prisma.providerService.findUnique({
      where: { id },
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
        ...(isActive !== undefined && { isActive }),
      },
      include: {
        service: {
          select: {
            id: true,
            titleAr: true,
            titleEn: true,
            descriptionAr: true,
            descriptionEn: true,
            image: true,
            commission: true,
          },
        },
      },
    });

    // Adjust offers if price changed
    if (price !== undefined && price !== providerService.price) {
      await this.adjustOffersForService(
        providerId,
        providerService.serviceId,
        price,
      );
    }

    // Get active offer for this provider service
    const activeOffer = await this.getActiveOffer(
      updatedProviderService.providerId,
      updatedProviderService.serviceId,
    );

    return {
      ...updatedProviderService,
      activeOffer: activeOffer || null,
    };
  }

  async remove(id: number, providerId: number) {
    const providerService = await this.prisma.providerService.findUnique({
      where: { id },
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
          in: ['pending', 'accepted', 'in_progress'],
        },
      },
    });

    if (activeOrders) {
      throw new BadRequestException('Cannot remove service with active orders');
    }

    await this.prisma.providerService.delete({
      where: { id },
    });

    return { message: 'Provider service removed successfully' };
  }

  async addMultipleServices(
    providerId: number,
    addServicesDto: AddServicesDto,
  ): Promise<{
    message: string;
    services: ProviderServiceWithOfferResponse[];
  }> {
    const { services } = addServicesDto;

    if (!services || services.length === 0) {
      throw new BadRequestException('At least one service must be provided');
    }

    // Validate provider exists
    const provider = await this.prisma.provider.findUnique({
      where: { id: providerId },
    });

    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    // Validate all services exist and can be assigned to providers
    const serviceIds = services.map((s) => s.serviceId);
    const existingServices = await this.prisma.service.findMany({
      where: {
        id: { in: serviceIds },
      },
      select: {
        id: true,
        titleAr: true,
        titleEn: true,
        serviceType: true,
      },
    });

    if (existingServices.length !== serviceIds.length) {
      throw new BadRequestException('One or more services not found');
    }

    // Check if all services can be assigned to providers
    for (const service of existingServices) {
      if (service.serviceType !== 'NORMAL') {
        throw new BadRequestException(
          `Service "${service.titleEn}" cannot be assigned to providers`,
        );
      }
    }

    // Check for existing provider services
    const existingProviderServices = await this.prisma.providerService.findMany(
      {
        where: {
          providerId,
          serviceId: { in: serviceIds },
        },
      },
    );

    const existingServiceIds = existingProviderServices.map(
      (ps) => ps.serviceId,
    );
    const newServices = services.filter(
      (s) => !existingServiceIds.includes(s.serviceId),
    );

    if (newServices.length === 0) {
      throw new BadRequestException(
        'All services are already offered by this provider',
      );
    }

    // Create new provider services
    const createdServices = await this.prisma.providerService.createMany({
      data: newServices.map((service) => ({
        providerId,
        serviceId: service.serviceId,
        price: service.price,
        isActive: service.isActive !== false, // Default to true
      })),
    });

    // Return the newly created services with full details
    const newProviderServices = await this.prisma.providerService.findMany({
      where: {
        providerId,
        serviceId: { in: newServices.map((s) => s.serviceId) },
      },
      include: {
        service: {
          select: {
            id: true,
            titleAr: true,
            titleEn: true,
            descriptionAr: true,
            descriptionEn: true,
            image: true,
            commission: true,
          },
        },
      },
    });

    // Get active offers for each provider service
    const newProviderServicesWithOffers = await Promise.all(
      newProviderServices.map(async (providerService) => {
        const activeOffer = await this.getActiveOffer(
          providerService.providerId,
          providerService.serviceId,
        );

        return {
          ...providerService,
          activeOffer: activeOffer || null,
        };
      }),
    );

    return {
      message: `Added ${createdServices.count} new services`,
      services: newProviderServicesWithOffers,
    };
  }

  async removeMultipleServices(providerId: number, serviceIds: number[]) {
    if (!serviceIds || serviceIds.length === 0) {
      throw new BadRequestException('At least one service ID must be provided');
    }

    // Check if provider exists
    const provider = await this.prisma.provider.findUnique({
      where: { id: providerId },
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
          in: ['pending', 'accepted', 'in_progress'],
        },
      },
    });

    if (activeOrders) {
      throw new BadRequestException(
        'Cannot remove services with active orders',
      );
    }

    // Remove provider services
    const result = await this.prisma.providerService.deleteMany({
      where: {
        providerId,
        serviceId: { in: serviceIds },
      },
    });

    return {
      message: `Removed ${result.count} services`,
      removedCount: result.count,
    };
  }

  async toggleServiceStatus(
    id: number,
    providerId: number,
  ): Promise<ProviderServiceWithOfferResponse> {
    const providerService = await this.prisma.providerService.findUnique({
      where: { id },
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
        isActive: !providerService.isActive,
      },
      include: {
        service: {
          select: {
            id: true,
            titleAr: true,
            titleEn: true,
            descriptionAr: true,
            descriptionEn: true,
            image: true,
            commission: true,
          },
        },
      },
    });

    // Get active offer for this provider service
    const activeOffer = await this.getActiveOffer(
      updatedProviderService.providerId,
      updatedProviderService.serviceId,
    );

    return {
      ...updatedProviderService,
      activeOffer: activeOffer || null,
    };
  }

  async getServiceStats(providerId: number) {
    const provider = await this.prisma.provider.findUnique({
      where: { id: providerId },
    });

    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    const providerServices = await this.prisma.providerService.findMany({
      where: { providerId },
      include: {
        service: true,
      },
    });

    const stats = {
      totalServices: providerServices.length,
      activeServices: providerServices.filter((ps) => ps.isActive).length,
      inactiveServices: providerServices.filter((ps) => !ps.isActive).length,
      averagePrice:
        providerServices.length > 0
          ? providerServices.reduce((sum, ps) => sum + ps.price, 0) /
            providerServices.length
          : 0,
      services: providerServices.map((ps) => ({
        id: ps.id,
        serviceId: ps.serviceId,
        serviceTitle: ps.service.titleEn,
        price: ps.price,
        isActive: ps.isActive,
      })),
    };

    return stats;
  }
}

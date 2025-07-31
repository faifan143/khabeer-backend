import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateOfferDto {
  providerId: number;
  serviceId: number;
  startDate: Date;
  endDate: Date;
  originalPrice: number;
  offerPrice: number;
  description: string;
}

export interface UpdateOfferDto {
  startDate?: Date;
  endDate?: Date;
  originalPrice?: number;
  offerPrice?: number;
  description?: string;
  isActive?: boolean;
}

@Injectable()
export class OffersService {
  constructor(private readonly prisma: PrismaService) { }

  async create(providerId: number, createOfferDto: CreateOfferDto) {
    const { serviceId, startDate, endDate, originalPrice, offerPrice, description } = createOfferDto;

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    if (start < now) {
      throw new BadRequestException('Start date cannot be in the past');
    }

    if (end <= start) {
      throw new BadRequestException('End date must be after start date');
    }

    // Validate prices
    if (originalPrice <= 0 || offerPrice <= 0) {
      throw new BadRequestException('Prices must be greater than 0');
    }

    if (offerPrice >= originalPrice) {
      throw new BadRequestException('Offer price must be less than original price');
    }

    // Check if provider exists and is verified
    const provider = await this.prisma.provider.findUnique({
      where: { id: providerId }
    });

    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    if (!provider.isVerified) {
      throw new BadRequestException('Only verified providers can create offers');
    }

    // Check if service exists
    const service = await this.prisma.service.findUnique({
      where: { id: serviceId }
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    // Check if provider offers this service
    const providerService = await this.prisma.providerService.findFirst({
      where: {
        providerId,
        serviceId,
        isActive: true
      }
    });

    if (!providerService) {
      throw new BadRequestException('Provider does not offer this service');
    }

    // Check for overlapping offers
    const overlappingOffer = await this.prisma.offer.findFirst({
      where: {
        providerId,
        serviceId,
        isActive: true,
        OR: [
          {
            AND: [
              { startDate: { lte: start } },
              { endDate: { gt: start } }
            ]
          },
          {
            AND: [
              { startDate: { lt: end } },
              { endDate: { gte: end } }
            ]
          },
          {
            AND: [
              { startDate: { gte: start } },
              { endDate: { lte: end } }
            ]
          }
        ]
      }
    });

    if (overlappingOffer) {
      throw new BadRequestException('An active offer already exists for this service during the specified period');
    }

    // Create the offer
    const offer = await this.prisma.offer.create({
      data: {
        providerId,
        serviceId,
        startDate: start,
        endDate: end,
        originalPrice,
        offerPrice,
        description
      },
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
            image: true
          }
        }
      }
    });

    return offer;
  }

  async findAll(providerId?: number, serviceId?: number, activeOnly: boolean = true) {
    const where: any = {};

    if (providerId) {
      where.providerId = providerId;
    }

    if (serviceId) {
      where.serviceId = serviceId;
    }

    if (activeOnly) {
      where.isActive = true;
      where.startDate = { lte: new Date() };
      where.endDate = { gt: new Date() };
    }

    const offers = await this.prisma.offer.findMany({
      where,
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            image: true,
            isVerified: true
          }
        },
        service: {
          select: {
            id: true,
            title: true,
            description: true,
            image: true
          }
        }
      },
      orderBy: {
        startDate: 'desc'
      }
    });

    return offers;
  }

  async findOne(id: number) {
    const offer = await this.prisma.offer.findUnique({
      where: { id },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            image: true,
            isVerified: true
          }
        },
        service: {
          select: {
            id: true,
            title: true,
            description: true,
            image: true
          }
        }
      }
    });

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    return offer;
  }

  async update(id: number, providerId: number, updateOfferDto: UpdateOfferDto) {
    const offer = await this.prisma.offer.findUnique({
      where: { id }
    });

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    if (offer.providerId !== providerId) {
      throw new ForbiddenException('You can only update your own offers');
    }

    const { startDate, endDate, originalPrice, offerPrice, description, isActive } = updateOfferDto;

    // Validate dates if provided
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const now = new Date();

      if (start < now) {
        throw new BadRequestException('Start date cannot be in the past');
      }

      if (end <= start) {
        throw new BadRequestException('End date must be after start date');
      }
    }

    // Validate prices if provided
    if (originalPrice && offerPrice) {
      if (originalPrice <= 0 || offerPrice <= 0) {
        throw new BadRequestException('Prices must be greater than 0');
      }

      if (offerPrice >= originalPrice) {
        throw new BadRequestException('Offer price must be less than original price');
      }
    }

    const updatedOffer = await this.prisma.offer.update({
      where: { id },
      data: {
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(originalPrice && { originalPrice }),
        ...(offerPrice && { offerPrice }),
        ...(description !== undefined && { description }),
        ...(isActive !== undefined && { isActive })
      },
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
            image: true
          }
        }
      }
    });

    return updatedOffer;
  }

  async remove(id: number, providerId: number) {
    const offer = await this.prisma.offer.findUnique({
      where: { id }
    });

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    if (offer.providerId !== providerId) {
      throw new ForbiddenException('You can only delete your own offers');
    }

    await this.prisma.offer.delete({
      where: { id }
    });

    return { message: 'Offer deleted successfully' };
  }

  async getActiveOffers(limit: number = 20) {
    const offers = await this.prisma.offer.findMany({
      where: {
        isActive: true,
        startDate: { lte: new Date() },
        endDate: { gt: new Date() },
        provider: {
          isVerified: true,
          isActive: true
        }
      },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            image: true,
            isVerified: true
          }
        },
        service: {
          select: {
            id: true,
            title: true,
            description: true,
            image: true
          }
        }
      },
      orderBy: {
        startDate: 'desc'
      },
      take: limit
    });

    return offers;
  }

  async getProviderOffers(providerId: number) {
    const provider = await this.prisma.provider.findUnique({
      where: { id: providerId }
    });

    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    const offers = await this.prisma.offer.findMany({
      where: { providerId },
      include: {
        service: {
          select: {
            id: true,
            title: true,
            description: true,
            image: true
          }
        }
      },
      orderBy: {
        startDate: 'desc'
      }
    });

    return offers;
  }

  async deactivateExpiredOffers() {
    const expiredOffers = await this.prisma.offer.findMany({
      where: {
        isActive: true,
        endDate: { lt: new Date() }
      }
    });

    if (expiredOffers.length > 0) {
      await this.prisma.offer.updateMany({
        where: {
          id: { in: expiredOffers.map(o => o.id) }
        },
        data: {
          isActive: false
        }
      });
    }

    return { message: `Deactivated ${expiredOffers.length} expired offers` };
  }
}

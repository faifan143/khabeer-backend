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

  /**
   * Normalizes a date to remove time components (hours, minutes, seconds, milliseconds)
   * Only compares years, months, and days
   */
  private normalizeDateToDateOnly(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  /**
   * Gets the current date normalized to date-only (no time components)
   */
  private getCurrentDateOnly(): Date {
    return this.normalizeDateToDateOnly(new Date());
  }

  async create(providerId: number, createOfferDto: CreateOfferDto) {
    const { serviceId, startDate, endDate, originalPrice, offerPrice, description } = createOfferDto;

    // Validate dates - normalize to date-only for comparison
    const start = this.normalizeDateToDateOnly(new Date(startDate));
    const end = this.normalizeDateToDateOnly(new Date(endDate));
    const now = this.getCurrentDateOnly();

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
            titleAr: true,
            titleEn: true,
            description: true,
            image: true
          }
        }
      }
    });

    return offer;
  }

  async findAll(providerId?: number, serviceId?: number, activeOnly: boolean = true, userState?: string, userRole?: string) {
    const where: any = {};

    if (providerId) {
      where.providerId = providerId;
    }

    if (serviceId) {
      where.serviceId = serviceId;
    }

    if (activeOnly) {
      where.isActive = true;
      where.startDate = { lte: this.getCurrentDateOnly() };
      where.endDate = { gt: this.getCurrentDateOnly() };
    }

    // Skip provider filtering for admins
    if (userRole !== 'ADMIN') {
      // Always filter out offers from inactive/offline providers
      where.provider = {
        isActive: true,
        onlineStatus: true
      };
    }

    // Add state filtering through provider and service relations
    if (userState && userState !== 'undefined' && userRole !== 'ADMIN') {
      where.AND = [
        {
          provider: {
            isActive: true,
            onlineStatus: true
          }
        },
        {
          OR: [
            {
              provider: {
                state: userState
              }
            },
            {
              service: {
                category: {
                  state: userState
                }
              }
            }
          ]
        }
      ];
    }

    const offers = await this.prisma.offer.findMany({
      where,
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            image: true,
            isVerified: true,
          }
        },
        service: {
          select: {
            id: true,
            titleAr: true,
            titleEn: true,
            description: true,
            image: true,
            category: {
              select: {
                state: true
              }
            }
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
            titleAr: true,
            titleEn: true,
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

    // Validate dates if provided - normalize to date-only for comparison
    if (startDate && endDate) {
      const start = this.normalizeDateToDateOnly(new Date(startDate));
      const end = this.normalizeDateToDateOnly(new Date(endDate));
      const now = this.getCurrentDateOnly();

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
        ...(startDate && { startDate: this.normalizeDateToDateOnly(new Date(startDate)) }),
        ...(endDate && { endDate: this.normalizeDateToDateOnly(new Date(endDate)) }),
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
            titleAr: true,
            titleEn: true,
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

  async getActiveOffers(limit: number = 20, userState?: string, userRole?: string) {
    console.log('🔍 Getting active offers with limit:', limit);
    const now = this.getCurrentDateOnly();
    console.log('📅 Current date (UTC):', now.toISOString());
    console.log('📅 Current date (local):', now.toString());
    console.log('🌍 Timezone offset (minutes):', now.getTimezoneOffset());
    console.log('🕐 Current time (local):', now.toLocaleString());

    const where: any = {
      isActive: true,
      startDate: { lte: now },
      endDate: { gt: now }
    };

    // Skip provider filtering for admins
    if (userRole !== 'ADMIN') {
      where.provider = {
        isVerified: true,
        isActive: true,
        onlineStatus: true
      };
    }

    // Add state filtering
    if (userState && userState !== 'undefined' && userRole !== 'ADMIN') {
      where.OR = [
        {
          provider: {
            ...where.provider,
            state: userState
          }
        },
        {
          service: {
            category: {
              state: userState
            }
          }
        }
      ];
    }

    const offers = await this.prisma.offer.findMany({
      where,
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            image: true,
            isVerified: true,
            state: true
          }
        },
        service: {
          select: {
            id: true,
            titleAr: true,
            titleEn: true,
            description: true,
            image: true,
            category: {
              select: {
                state: true
              }
            }
          }
        }
      },
      orderBy: {
        startDate: 'desc'
      },
      take: limit
    });

    console.log('✅ Filtered active offers:', offers.length);
    console.log('🎯 Final offers:', offers.map(o => ({
      id: o.id,
      providerId: o.providerId,
      serviceId: o.serviceId,
      startDate: o.startDate,
      endDate: o.endDate
    })));

    return offers;
  }

  async getProviderOffers(providerId: number) {
    const provider = await this.prisma.provider.findUnique({
      where: { id: providerId }
    });

    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    const now = this.getCurrentDateOnly();
    const offers = await this.prisma.offer.findMany({
      where: {
        providerId,
        isActive: true,
        startDate: { lte: now },
        endDate: { gt: now }
      },
      include: {
        service: {
          select: {
            id: true,
            titleAr: true,
            titleEn: true,
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
        endDate: { lt: this.getCurrentDateOnly() }
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

  async debugAllOffers() {
    const offers = await this.prisma.offer.findMany({
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            isVerified: true,
            isActive: true
          }
        },
        service: {
          select: {
            id: true,
            titleAr: true,
            titleEn: true
          }
        }
      },
      orderBy: {
        startDate: 'desc'
      }
    });

    return {
      totalOffers: offers.length,
      currentDate: this.getCurrentDateOnly().toISOString(),
      offers: offers.map(o => ({
        id: o.id,
        providerId: o.providerId,
        serviceId: o.serviceId,
        isActive: o.isActive,
        startDate: o.startDate,
        endDate: o.endDate,
        provider: {
          id: o.provider.id,
          name: o.provider.name,
          isVerified: o.provider.isVerified,
          isActive: o.provider.isActive
        },
        service: {
          id: o.service.id,
          title: o.service.titleEn
        },
        // Check each filter criteria
        passesIsActive: o.isActive,
        passesStartDate: o.startDate <= this.getCurrentDateOnly(),
        passesEndDate: o.endDate > this.getCurrentDateOnly(),
        passesProviderVerified: o.provider.isVerified,
        passesProviderActive: o.provider.isActive,
        // Overall result
        wouldBeVisible: o.isActive &&
          o.startDate <= this.getCurrentDateOnly() &&
          o.endDate > this.getCurrentDateOnly() &&
          o.provider.isVerified &&
          o.provider.isActive
      }))
    };
  }

  async debugActiveOffersCriteria() {
    const now = this.getCurrentDateOnly();

    // Check offers that fail each criteria
    const inactiveOffers = await this.prisma.offer.findMany({
      where: { isActive: false },
      select: { id: true, providerId: true, serviceId: true }
    });

    const futureStartOffers = await this.prisma.offer.findMany({
      where: { startDate: { gt: now } },
      select: { id: true, providerId: true, serviceId: true, startDate: true }
    });

    const expiredOffers = await this.prisma.offer.findMany({
      where: { endDate: { lte: now } },
      select: { id: true, providerId: true, serviceId: true, endDate: true }
    });

    const unverifiedProviderOffers = await this.prisma.offer.findMany({
      where: {
        provider: { isVerified: false }
      },
      select: { id: true, providerId: true, serviceId: true }
    });

    const inactiveProviderOffers = await this.prisma.offer.findMany({
      where: {
        provider: { isActive: false }
      },
      select: { id: true, providerId: true, serviceId: true }
    });

    return {
      currentDate: now.toISOString(),
      criteria: {
        inactiveOffers: {
          count: inactiveOffers.length,
          offers: inactiveOffers
        },
        futureStartOffers: {
          count: futureStartOffers.length,
          offers: futureStartOffers
        },
        expiredOffers: {
          count: expiredOffers.length,
          offers: expiredOffers
        },
        unverifiedProviderOffers: {
          count: unverifiedProviderOffers.length,
          offers: unverifiedProviderOffers
        },
        inactiveProviderOffers: {
          count: inactiveProviderOffers.length,
          offers: inactiveProviderOffers
        }
      }
    };
  }

  async getFlexibleActiveOffers(limit: number = 20) {
    console.log('🔍 Getting flexible active offers with limit:', limit);
    const now = this.getCurrentDateOnly();
    console.log('📅 Current date:', now.toISOString());

    // Use the same date validation logic as all other offer endpoints
    const offers = await this.prisma.offer.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gt: now }
      },
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
            titleAr: true,
            titleEn: true,
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

    console.log('✅ Flexible filtered offers:', offers.length);
    console.log('🎯 Flexible offers:', offers.map(o => ({
      id: o.id,
      providerId: o.providerId,
      serviceId: o.serviceId,
      startDate: o.startDate,
      endDate: o.endDate,
      providerVerified: o.provider.isVerified,
      providerActive: o.provider.isActive
    })));

    return offers;
  }

  async getAvailableOffers(limit: number = 20) {
    console.log('🔍 Getting available offers with limit:', limit);
    const now = this.getCurrentDateOnly();
    console.log('📅 Current date:', now.toISOString());

    // Use the same date validation logic as all other offer endpoints
    const offers = await this.prisma.offer.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gt: now },
        provider: {
          isVerified: true // Still require verified provider for safety
        }
      },
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
            titleAr: true,
            titleEn: true,
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

    console.log('✅ Available offers:', offers.length);
    return offers;
  }

  async debugSpecificOffer(id: number) {
    const offer = await this.prisma.offer.findUnique({
      where: { id },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            isVerified: true,
            isActive: true
          }
        },
        service: {
          select: {
            id: true,
            titleAr: true,
            titleEn: true
          }
        }
      }
    });

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    const now = this.getCurrentDateOnly();

    const result: {
      offer: any;
      provider: any;
      service: any;
      currentDate: any;
      filterChecks: any;
      wouldBeVisible: boolean;
      issues: string[];
    } = {
      offer: {
        id: offer.id,
        providerId: offer.providerId,
        serviceId: offer.serviceId,
        isActive: offer.isActive,
        startDate: offer.startDate,
        endDate: offer.endDate,
        startDateLocal: offer.startDate.toString(),
        endDateLocal: offer.endDate.toString(),
        description: offer.description,
        offerPrice: offer.offerPrice,
        originalPrice: offer.originalPrice
      },
      provider: offer.provider,
      service: offer.service,
      currentDate: {
        utc: now.toISOString(),
        local: now.toString()
      },
      filterChecks: {
        isActive: offer.isActive,
        startDateCheck: offer.startDate <= now,
        endDateCheck: offer.endDate > now,
        providerVerified: offer.provider.isVerified,
        providerActive: offer.provider.isActive
      },
      wouldBeVisible: offer.isActive &&
        offer.startDate <= now &&
        offer.endDate > now &&
        offer.provider.isVerified &&
        offer.provider.isActive,
      issues: []
    };

    // Identify specific issues
    if (!offer.isActive) {
      result.issues.push('Offer is marked as inactive');
    }

    if (offer.startDate > now) {
      result.issues.push(`Offer start date (${offer.startDate.toISOString()}) is in the future`);
    }

    if (offer.endDate <= now) {
      result.issues.push(`Offer end date (${offer.endDate.toISOString()}) has passed`);
    }

    if (!offer.provider.isVerified) {
      result.issues.push('Provider is not verified');
    }

    if (!offer.provider.isActive) {
      result.issues.push('Provider account is inactive');
    }

    return result;
  }
}

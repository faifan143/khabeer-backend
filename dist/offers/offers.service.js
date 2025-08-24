"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OffersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let OffersService = class OffersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(providerId, createOfferDto) {
        const { serviceId, startDate, endDate, originalPrice, offerPrice, description } = createOfferDto;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const now = new Date();
        if (start < now) {
            throw new common_1.BadRequestException('Start date cannot be in the past');
        }
        if (end <= start) {
            throw new common_1.BadRequestException('End date must be after start date');
        }
        if (originalPrice <= 0 || offerPrice <= 0) {
            throw new common_1.BadRequestException('Prices must be greater than 0');
        }
        if (offerPrice >= originalPrice) {
            throw new common_1.BadRequestException('Offer price must be less than original price');
        }
        const provider = await this.prisma.provider.findUnique({
            where: { id: providerId }
        });
        if (!provider) {
            throw new common_1.NotFoundException('Provider not found');
        }
        if (!provider.isVerified) {
            throw new common_1.BadRequestException('Only verified providers can create offers');
        }
        const service = await this.prisma.service.findUnique({
            where: { id: serviceId }
        });
        if (!service) {
            throw new common_1.NotFoundException('Service not found');
        }
        const providerService = await this.prisma.providerService.findFirst({
            where: {
                providerId,
                serviceId,
                isActive: true
            }
        });
        if (!providerService) {
            throw new common_1.BadRequestException('Provider does not offer this service');
        }
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
            throw new common_1.BadRequestException('An active offer already exists for this service during the specified period');
        }
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
    async findAll(providerId, serviceId, activeOnly = true) {
        const where = {};
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
    async findOne(id) {
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
            throw new common_1.NotFoundException('Offer not found');
        }
        return offer;
    }
    async update(id, providerId, updateOfferDto) {
        const offer = await this.prisma.offer.findUnique({
            where: { id }
        });
        if (!offer) {
            throw new common_1.NotFoundException('Offer not found');
        }
        if (offer.providerId !== providerId) {
            throw new common_1.ForbiddenException('You can only update your own offers');
        }
        const { startDate, endDate, originalPrice, offerPrice, description, isActive } = updateOfferDto;
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const now = new Date();
            if (start < now) {
                throw new common_1.BadRequestException('Start date cannot be in the past');
            }
            if (end <= start) {
                throw new common_1.BadRequestException('End date must be after start date');
            }
        }
        if (originalPrice && offerPrice) {
            if (originalPrice <= 0 || offerPrice <= 0) {
                throw new common_1.BadRequestException('Prices must be greater than 0');
            }
            if (offerPrice >= originalPrice) {
                throw new common_1.BadRequestException('Offer price must be less than original price');
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
    async remove(id, providerId) {
        const offer = await this.prisma.offer.findUnique({
            where: { id }
        });
        if (!offer) {
            throw new common_1.NotFoundException('Offer not found');
        }
        if (offer.providerId !== providerId) {
            throw new common_1.ForbiddenException('You can only delete your own offers');
        }
        await this.prisma.offer.delete({
            where: { id }
        });
        return { message: 'Offer deleted successfully' };
    }
    async getActiveOffers(limit = 20) {
        console.log('🔍 Getting active offers with limit:', limit);
        const now = new Date();
        console.log('📅 Current date (UTC):', now.toISOString());
        console.log('📅 Current date (local):', now.toString());
        console.log('🌍 Timezone offset (minutes):', now.getTimezoneOffset());
        console.log('🕐 Current time (local):', now.toLocaleString());
        const allOffers = await this.prisma.offer.findMany({
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
                        image: true
                    }
                }
            }
        });
        console.log('📊 Total offers in database:', allOffers.length);
        console.log('📋 All offers:', allOffers.map(o => ({
            id: o.id,
            providerId: o.providerId,
            serviceId: o.serviceId,
            isActive: o.isActive,
            startDate: o.startDate,
            endDate: o.endDate,
            startDateLocal: o.startDate.toString(),
            endDateLocal: o.endDate.toString(),
            startDateISO: o.startDate.toISOString(),
            endDateISO: o.endDate.toISOString(),
            providerVerified: o.provider.isVerified,
            providerActive: o.provider.isActive,
            startDateCheck: o.startDate <= now,
            endDateCheck: o.endDate > now
        })));
        const offers = await this.prisma.offer.findMany({
            where: {
                isActive: true,
                startDate: { lte: now },
                endDate: { gt: now },
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
    async getProviderOffers(providerId) {
        const provider = await this.prisma.provider.findUnique({
            where: { id: providerId }
        });
        if (!provider) {
            throw new common_1.NotFoundException('Provider not found');
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
                        title: true
                    }
                }
            },
            orderBy: {
                startDate: 'desc'
            }
        });
        return {
            totalOffers: offers.length,
            currentDate: new Date().toISOString(),
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
                    title: o.service.title
                },
                passesIsActive: o.isActive,
                passesStartDate: o.startDate <= new Date(),
                passesEndDate: o.endDate > new Date(),
                passesProviderVerified: o.provider.isVerified,
                passesProviderActive: o.provider.isActive,
                wouldBeVisible: o.isActive &&
                    o.startDate <= new Date() &&
                    o.endDate > new Date() &&
                    o.provider.isVerified &&
                    o.provider.isActive
            }))
        };
    }
    async debugActiveOffersCriteria() {
        const now = new Date();
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
    async getFlexibleActiveOffers(limit = 20) {
        console.log('🔍 Getting flexible active offers with limit:', limit);
        console.log('📅 Current date:', new Date().toISOString());
        const offers = await this.prisma.offer.findMany({
            where: {
                isActive: true,
                endDate: { gt: new Date() }
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
    async getAvailableOffers(limit = 20) {
        console.log('🔍 Getting available offers with limit:', limit);
        console.log('📅 Current date:', new Date().toISOString());
        const offers = await this.prisma.offer.findMany({
            where: {
                isActive: true,
                endDate: { gt: new Date() },
                provider: {
                    isVerified: true
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
        console.log('✅ Available offers:', offers.length);
        return offers;
    }
    async debugSpecificOffer(id) {
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
                        title: true
                    }
                }
            }
        });
        if (!offer) {
            throw new common_1.NotFoundException('Offer not found');
        }
        const now = new Date();
        const result = {
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
};
exports.OffersService = OffersService;
exports.OffersService = OffersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OffersService);
//# sourceMappingURL=offers.service.js.map
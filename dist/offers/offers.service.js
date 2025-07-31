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
};
exports.OffersService = OffersService;
exports.OffersService = OffersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OffersService);
//# sourceMappingURL=offers.service.js.map
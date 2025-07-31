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
exports.ProviderRatingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ProviderRatingsService = class ProviderRatingsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, createRatingDto) {
        const { providerId, orderId, rating, comment } = createRatingDto;
        if (rating < 1 || rating > 5) {
            throw new common_1.BadRequestException('Rating must be between 1 and 5');
        }
        const provider = await this.prisma.provider.findUnique({
            where: { id: providerId }
        });
        if (!provider) {
            throw new common_1.NotFoundException('Provider not found');
        }
        if (orderId) {
            const order = await this.prisma.order.findUnique({
                where: { id: orderId }
            });
            if (!order) {
                throw new common_1.NotFoundException('Order not found');
            }
            if (order.userId !== userId) {
                throw new common_1.ForbiddenException('You can only rate orders you placed');
            }
            if (order.providerId !== providerId) {
                throw new common_1.BadRequestException('Order does not belong to this provider');
            }
            if (order.status !== 'completed') {
                throw new common_1.BadRequestException('You can only rate completed orders');
            }
        }
        const existingRating = await this.prisma.providerRating.findFirst({
            where: {
                userId,
                providerId,
                ...(orderId && { orderId })
            }
        });
        if (existingRating) {
            throw new common_1.BadRequestException('You have already rated this provider');
        }
        const newRating = await this.prisma.providerRating.create({
            data: {
                userId,
                providerId,
                orderId,
                rating,
                comment
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        image: true
                    }
                },
                provider: {
                    select: {
                        id: true,
                        name: true,
                        image: true
                    }
                }
            }
        });
        return newRating;
    }
    async findAll(providerId) {
        const where = providerId ? { providerId } : {};
        const ratings = await this.prisma.providerRating.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        image: true
                    }
                },
                provider: {
                    select: {
                        id: true,
                        name: true,
                        image: true
                    }
                }
            },
            orderBy: {
                ratingDate: 'desc'
            }
        });
        return ratings;
    }
    async findByProvider(providerId) {
        const provider = await this.prisma.provider.findUnique({
            where: { id: providerId }
        });
        if (!provider) {
            throw new common_1.NotFoundException('Provider not found');
        }
        const ratings = await this.prisma.providerRating.findMany({
            where: { providerId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        image: true
                    }
                }
            },
            orderBy: {
                ratingDate: 'desc'
            }
        });
        const averageRating = ratings.length > 0
            ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
            : 0;
        const ratingDistribution = {
            1: ratings.filter(r => r.rating === 1).length,
            2: ratings.filter(r => r.rating === 2).length,
            3: ratings.filter(r => r.rating === 3).length,
            4: ratings.filter(r => r.rating === 4).length,
            5: ratings.filter(r => r.rating === 5).length
        };
        return {
            provider: {
                id: provider.id,
                name: provider.name,
                image: provider.image
            },
            ratings,
            averageRating: Math.round(averageRating * 10) / 10,
            totalRatings: ratings.length,
            ratingDistribution
        };
    }
    async findOne(id) {
        const rating = await this.prisma.providerRating.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        image: true
                    }
                },
                provider: {
                    select: {
                        id: true,
                        name: true,
                        image: true
                    }
                }
            }
        });
        if (!rating) {
            throw new common_1.NotFoundException('Rating not found');
        }
        return rating;
    }
    async update(id, userId, updateRatingDto) {
        const rating = await this.prisma.providerRating.findUnique({
            where: { id }
        });
        if (!rating) {
            throw new common_1.NotFoundException('Rating not found');
        }
        if (rating.userId !== userId) {
            throw new common_1.ForbiddenException('You can only update your own ratings');
        }
        const { rating: newRating, comment } = updateRatingDto;
        if (newRating && (newRating < 1 || newRating > 5)) {
            throw new common_1.BadRequestException('Rating must be between 1 and 5');
        }
        const updatedRating = await this.prisma.providerRating.update({
            where: { id },
            data: {
                ...(newRating && { rating: newRating }),
                ...(comment !== undefined && { comment })
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        image: true
                    }
                },
                provider: {
                    select: {
                        id: true,
                        name: true,
                        image: true
                    }
                }
            }
        });
        return updatedRating;
    }
    async remove(id, userId) {
        const rating = await this.prisma.providerRating.findUnique({
            where: { id }
        });
        if (!rating) {
            throw new common_1.NotFoundException('Rating not found');
        }
        if (rating.userId !== userId) {
            throw new common_1.ForbiddenException('You can only delete your own ratings');
        }
        await this.prisma.providerRating.delete({
            where: { id }
        });
        return { message: 'Rating deleted successfully' };
    }
    async getUserRatings(userId) {
        const ratings = await this.prisma.providerRating.findMany({
            where: { userId },
            include: {
                provider: {
                    select: {
                        id: true,
                        name: true,
                        image: true
                    }
                }
            },
            orderBy: {
                ratingDate: 'desc'
            }
        });
        return ratings;
    }
    async getTopRatedProviders(limit = 10) {
        const providers = await this.prisma.provider.findMany({
            where: {
                isActive: true,
                isVerified: true
            },
            include: {
                ratings: {
                    select: {
                        rating: true
                    }
                }
            }
        });
        const providersWithRating = providers
            .map(provider => {
            const averageRating = provider.ratings.length > 0
                ? provider.ratings.reduce((sum, r) => sum + r.rating, 0) / provider.ratings.length
                : 0;
            return {
                ...provider,
                averageRating: Math.round(averageRating * 10) / 10,
                totalRatings: provider.ratings.length
            };
        })
            .filter(provider => provider.totalRatings > 0)
            .sort((a, b) => b.averageRating - a.averageRating)
            .slice(0, limit);
        return providersWithRating;
    }
};
exports.ProviderRatingsService = ProviderRatingsService;
exports.ProviderRatingsService = ProviderRatingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProviderRatingsService);
//# sourceMappingURL=provider-ratings.service.js.map
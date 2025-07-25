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
exports.SearchService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SearchService = class SearchService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async searchServices(filters) {
        const where = {
            providerServices: {
                some: {
                    isActive: true,
                    provider: {
                        isActive: true
                    }
                }
            }
        };
        if (filters.query) {
            where.OR = [
                { title: { contains: filters.query, mode: 'insensitive' } },
                { description: { contains: filters.query, mode: 'insensitive' } }
            ];
        }
        if (filters.categoryId) {
            where.categoryId = filters.categoryId;
        }
        const services = await this.prisma.service.findMany({
            where,
            include: {
                category: true,
                providerServices: {
                    where: {
                        isActive: true,
                        provider: {
                            isActive: true
                        }
                    },
                    include: {
                        provider: {
                            select: {
                                id: true,
                                name: true,
                                image: true,
                                description: true,
                                isVerified: true,
                                ratings: {
                                    select: {
                                        rating: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
        let filteredServices = services.map(service => {
            const activeProviders = service.providerServices.filter(ps => {
                if (filters.minPrice && ps.price < filters.minPrice)
                    return false;
                if (filters.maxPrice && ps.price > filters.maxPrice)
                    return false;
                if (filters.isVerified && !ps.provider.isVerified)
                    return false;
                if (filters.minRating) {
                    const avgRating = this.calculateAverageRating(ps.provider.ratings);
                    if (avgRating < filters.minRating)
                        return false;
                }
                return true;
            });
            return {
                ...service,
                providerServices: activeProviders
            };
        });
        filteredServices = filteredServices.filter(service => service.providerServices.length > 0);
        return filteredServices;
    }
    async searchProviders(filters) {
        const where = {
            isActive: true,
            providerServices: {
                some: {
                    isActive: true
                }
            }
        };
        if (filters.query) {
            where.OR = [
                { name: { contains: filters.query, mode: 'insensitive' } },
                { description: { contains: filters.query, mode: 'insensitive' } }
            ];
        }
        if (filters.isVerified !== undefined) {
            where.isVerified = filters.isVerified;
        }
        const providers = await this.prisma.provider.findMany({
            where,
            include: {
                providerServices: {
                    where: {
                        isActive: true
                    },
                    include: {
                        service: {
                            include: {
                                category: true
                            }
                        }
                    }
                },
                ratings: {
                    select: {
                        rating: true
                    }
                }
            }
        });
        let filteredProviders = providers.map(provider => {
            const activeServices = provider.providerServices.filter(ps => {
                if (filters.minPrice && ps.price < filters.minPrice)
                    return false;
                if (filters.maxPrice && ps.price > filters.maxPrice)
                    return false;
                if (filters.categoryId && ps.service.categoryId !== filters.categoryId)
                    return false;
                return true;
            });
            return {
                ...provider,
                providerServices: activeServices,
                averageRating: this.calculateAverageRating(provider.ratings)
            };
        });
        if (filters.minRating && filters.minRating > 0) {
            filteredProviders = filteredProviders.filter(provider => provider.averageRating >= filters.minRating);
        }
        filteredProviders = filteredProviders.filter(provider => provider.providerServices.length > 0);
        return filteredProviders;
    }
    async searchByLocation(location) {
        const providers = await this.prisma.provider.findMany({
            where: {
                isActive: true,
                state: { contains: location, mode: 'insensitive' }
            },
            include: {
                providerServices: {
                    where: {
                        isActive: true
                    },
                    include: {
                        service: {
                            include: {
                                category: true
                            }
                        }
                    }
                },
                ratings: {
                    select: {
                        rating: true
                    }
                }
            }
        });
        return providers.map(provider => ({
            ...provider,
            averageRating: this.calculateAverageRating(provider.ratings)
        }));
    }
    async getPopularServices(limit = 10) {
        const services = await this.prisma.service.findMany({
            include: {
                category: true,
                orders: {
                    where: {
                        status: 'completed',
                        orderDate: {
                            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                        }
                    }
                },
                providerServices: {
                    where: {
                        isActive: true,
                        provider: {
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
                        }
                    }
                }
            }
        });
        const sortedServices = services
            .map(service => ({
            ...service,
            orderCount: service.orders.length
        }))
            .sort((a, b) => b.orderCount - a.orderCount)
            .slice(0, limit);
        return sortedServices;
    }
    async getTopRatedProviders(limit = 10) {
        const providers = await this.prisma.provider.findMany({
            where: {
                isActive: true
            },
            include: {
                ratings: {
                    select: {
                        rating: true
                    }
                },
                providerServices: {
                    where: {
                        isActive: true
                    },
                    include: {
                        service: {
                            include: {
                                category: true
                            }
                        }
                    }
                }
            }
        });
        const providersWithRating = providers
            .map(provider => ({
            ...provider,
            averageRating: this.calculateAverageRating(provider.ratings)
        }))
            .filter(provider => provider.averageRating > 0)
            .sort((a, b) => b.averageRating - a.averageRating)
            .slice(0, limit);
        return providersWithRating;
    }
    calculateAverageRating(ratings) {
        if (ratings.length === 0)
            return 0;
        const sum = ratings.reduce((acc, rating) => acc + rating.rating, 0);
        return Math.round((sum / ratings.length) * 10) / 10;
    }
};
exports.SearchService = SearchService;
exports.SearchService = SearchService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SearchService);
//# sourceMappingURL=search.service.js.map
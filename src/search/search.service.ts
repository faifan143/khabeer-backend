import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface SearchFilters {
    query?: string;
    categoryId?: number;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    location?: string;
    isVerified?: boolean;
    availability?: string; // 'available', 'busy', 'offline'
    sortBy?: string; // 'price', 'rating', 'name', 'popularity'
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
    providerId?: number;
    serviceIds?: number[];
}

export interface SearchResult<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
    filters: SearchFilters;
}

@Injectable()
export class SearchService {
    constructor(private readonly prisma: PrismaService) { }

    async searchServices(filters: SearchFilters): Promise<SearchResult<any>> {
        const page = filters.page || 1;
        const limit = filters.limit || 10;
        const skip = (page - 1) * limit;

        const where: any = {
            providerServices: {
                some: {
                    isActive: true,
                    provider: {
                        isActive: true
                    }
                }
            }
        };

        // Enhanced text search
        if (filters.query) {
            where.OR = [
                { title: { contains: filters.query, mode: 'insensitive' } },
                { description: { contains: filters.query, mode: 'insensitive' } },
                { category: { titleEn: { contains: filters.query, mode: 'insensitive' } } },
                { category: { titleAr: { contains: filters.query, mode: 'insensitive' } } }
            ];
        }

        // Category filter
        if (filters.categoryId) {
            where.categoryId = filters.categoryId;
        }

        // Service IDs filter
        if (filters.serviceIds && filters.serviceIds.length > 0) {
            where.id = { in: filters.serviceIds };
        }

        // Get total count
        const total = await this.prisma.service.count({ where });

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
                                state: true,
                                ratings: {
                                    select: {
                                        rating: true
                                    }
                                },
                                orders: {
                                    where: {
                                        status: { in: ['accepted', 'in_progress'] }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            skip,
            take: limit
        });

        // Apply advanced filters
        let filteredServices = services.map(service => {
            const activeProviders = service.providerServices.filter(ps => {
                // Price filter
                if (filters.minPrice && ps.price < filters.minPrice) return false;
                if (filters.maxPrice && ps.price > filters.maxPrice) return false;

                // Verification filter
                if (filters.isVerified && !ps.provider.isVerified) return false;

                // Rating filter
                if (filters.minRating) {
                    const avgRating = this.calculateAverageRating(ps.provider.ratings);
                    if (avgRating < filters.minRating) return false;
                }

                // Availability filter
                if (filters.availability) {
                    const isAvailable = this.checkProviderAvailability(ps.provider, filters.availability);
                    if (!isAvailable) return false;
                }

                return true;
            });

            return {
                ...service,
                providerServices: activeProviders,
                totalProviders: activeProviders.length,
                priceRange: this.calculatePriceRange(activeProviders),
                averageRating: this.calculateServiceAverageRating(activeProviders)
            };
        });

        // Remove services with no active providers
        filteredServices = filteredServices.filter(service => service.providerServices.length > 0);

        // Apply sorting
        if (filters.sortBy) {
            filteredServices = this.sortServices(filteredServices, filters.sortBy, filters.sortOrder);
        }

        return {
            data: filteredServices,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            },
            filters
        };
    }

    async searchProviders(filters: SearchFilters): Promise<SearchResult<any>> {
        const page = filters.page || 1;
        const limit = filters.limit || 10;
        const skip = (page - 1) * limit;

        const where: any = {
            isActive: true,
            providerServices: {
                some: {
                    isActive: true
                }
            }
        };

        // Enhanced text search
        if (filters.query) {
            where.OR = [
                { name: { contains: filters.query, mode: 'insensitive' } },
                { description: { contains: filters.query, mode: 'insensitive' } },
                { state: { contains: filters.query, mode: 'insensitive' } }
            ];
        }

        // Provider ID filter
        if (filters.providerId) {
            where.id = filters.providerId;
        }

        // Verification filter
        if (filters.isVerified !== undefined) {
            where.isVerified = filters.isVerified;
        }

        // Get total count
        const total = await this.prisma.provider.count({ where });

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
                },
                orders: {
                    where: {
                        status: { in: ['accepted', 'in_progress'] }
                    }
                }
            },
            skip,
            take: limit
        });

        // Apply advanced filters
        let filteredProviders = providers.map(provider => {
            const activeServices = provider.providerServices.filter(ps => {
                // Price filter
                if (filters.minPrice && ps.price < filters.minPrice) return false;
                if (filters.maxPrice && ps.price > filters.maxPrice) return false;

                // Category filter
                if (filters.categoryId && ps.service.categoryId !== filters.categoryId) return false;

                return true;
            });

            const averageRating = this.calculateAverageRating(provider.ratings);
            const isAvailable = this.checkProviderAvailability(provider, filters.availability);

            return {
                ...provider,
                providerServices: activeServices,
                averageRating,
                isAvailable,
                totalServices: activeServices.length,
                priceRange: this.calculatePriceRange(activeServices),
                orderCount: provider.orders.length
            };
        });

        // Rating filter
        if (filters.minRating && filters.minRating > 0) {
            filteredProviders = filteredProviders.filter(provider =>
                provider.averageRating >= filters.minRating!
            );
        }

        // Availability filter
        if (filters.availability) {
            filteredProviders = filteredProviders.filter(provider => provider.isAvailable);
        }

        // Remove providers with no active services
        filteredProviders = filteredProviders.filter(provider => provider.providerServices.length > 0);

        // Apply sorting
        if (filters.sortBy) {
            filteredProviders = this.sortProviders(filteredProviders, filters.sortBy, filters.sortOrder);
        }

        return {
            data: filteredProviders,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            },
            filters
        };
    }

    async searchByLocation(location: string, radius?: number): Promise<any[]> {
        const providers = await this.prisma.provider.findMany({
            where: {
                isActive: true,
                OR: [
                    { state: { contains: location, mode: 'insensitive' } },
                    { name: { contains: location, mode: 'insensitive' } }
                ]
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
            averageRating: this.calculateAverageRating(provider.ratings),
            distance: this.calculateDistance(location, provider.state)
        }));
    }

    async getPopularServices(limit: number = 10, days: number = 30): Promise<any[]> {
        const dateThreshold = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

        const services = await this.prisma.service.findMany({
            include: {
                category: true,
                orders: {
                    where: {
                        status: 'completed',
                        orderDate: {
                            gte: dateThreshold
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
                orderCount: service.orders.length,
                revenue: service.orders.reduce((sum, order) => sum + order.totalAmount, 0)
            }))
            .sort((a, b) => b.orderCount - a.orderCount)
            .slice(0, limit);

        return sortedServices;
    }

    async getTopRatedProviders(limit: number = 10, minReviews: number = 3): Promise<any[]> {
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
                averageRating: this.calculateAverageRating(provider.ratings),
                reviewCount: provider.ratings.length
            }))
            .filter(provider => provider.reviewCount >= minReviews && provider.averageRating > 0)
            .sort((a, b) => b.averageRating - a.averageRating)
            .slice(0, limit);

        return providersWithRating;
    }

    async getSearchSuggestions(query: string, limit: number = 5): Promise<any> {
        const suggestions: {
            services: any[];
            providers: any[];
            categories: any[];
        } = {
            services: [],
            providers: [],
            categories: []
        };

        if (query.length < 2) return suggestions;

        // Service suggestions
        suggestions.services = await this.prisma.service.findMany({
            where: {
                title: { contains: query, mode: 'insensitive' }
            },
            select: {
                id: true,
                title: true,
                category: {
                    select: {
                        titleEn: true
                    }
                }
            },
            take: limit
        });

        // Provider suggestions
        suggestions.providers = await this.prisma.provider.findMany({
            where: {
                name: { contains: query, mode: 'insensitive' },
                isActive: true
            },
            select: {
                id: true,
                name: true,
                state: true
            },
            take: limit
        });

        // Category suggestions
        suggestions.categories = await this.prisma.category.findMany({
            where: {
                OR: [
                    { titleEn: { contains: query, mode: 'insensitive' } },
                    { titleAr: { contains: query, mode: 'insensitive' } }
                ]
            },
            select: {
                id: true,
                titleEn: true,
                titleAr: true
            },
            take: limit
        });

        return suggestions;
    }

    async searchServicesWithPagination(filters: SearchFilters, page: number = 1, limit: number = 10): Promise<any> {
        const skip = (page - 1) * limit;

        const where: any = {
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

        const total = await this.prisma.service.count({ where });

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
            },
            skip,
            take: limit
        });

        const filteredServices = services.map(service => {
            const activeProviders = service.providerServices.filter(ps => {
                if (filters.minPrice && ps.price < filters.minPrice) return false;
                if (filters.maxPrice && ps.price > filters.maxPrice) return false;
                if (filters.isVerified && !ps.provider.isVerified) return false;
                if (filters.minRating) {
                    const avgRating = this.calculateAverageRating(ps.provider.ratings);
                    if (avgRating < filters.minRating) return false;
                }
                return true;
            });

            return {
                ...service,
                providerServices: activeProviders
            };
        }).filter(service => service.providerServices.length > 0);

        return {
            data: filteredServices,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            }
        };
    }

    async getTrendingServices(limit: number = 10): Promise<any[]> {
        const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const lastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        const services = await this.prisma.service.findMany({
            include: {
                category: true,
                orders: {
                    where: {
                        status: 'completed'
                    }
                },
                providerServices: {
                    where: {
                        isActive: true,
                        provider: {
                            isActive: true
                        }
                    }
                }
            }
        });

        const trendingServices = services
            .map(service => {
                const recentOrders = service.orders.filter(order =>
                    order.orderDate >= lastWeek
                );
                const previousOrders = service.orders.filter(order =>
                    order.orderDate >= lastMonth && order.orderDate < lastWeek
                );

                const growthRate = previousOrders.length > 0
                    ? ((recentOrders.length - previousOrders.length) / previousOrders.length) * 100
                    : recentOrders.length > 0 ? 100 : 0;

                return {
                    ...service,
                    recentOrders: recentOrders.length,
                    previousOrders: previousOrders.length,
                    growthRate
                };
            })
            .filter(service => service.growthRate > 0)
            .sort((a, b) => b.growthRate - a.growthRate)
            .slice(0, limit);

        return trendingServices;
    }

    private checkProviderAvailability(provider: any, availability?: string): boolean {
        if (!availability) return true;

        const activeOrders = provider.orders?.length || 0;

        switch (availability) {
            case 'available':
                return activeOrders < 5;
            case 'busy':
                return activeOrders >= 5 && activeOrders < 10;
            case 'offline':
                return activeOrders >= 10;
            default:
                return true;
        }
    }

    private calculatePriceRange(items: any[]): { min: number; max: number } {
        if (items.length === 0) return { min: 0, max: 0 };

        const prices = items.map(item => item.price || 0);
        return {
            min: Math.min(...prices),
            max: Math.max(...prices)
        };
    }

    private calculateServiceAverageRating(providerServices: any[]): number {
        const allRatings = providerServices.flatMap(ps => ps.provider.ratings);
        return this.calculateAverageRating(allRatings);
    }

    private calculateDistance(from: string, to: string): number {
        return from.toLowerCase() === to.toLowerCase() ? 0 : 10;
    }

    private calculateAverageRating(ratings: { rating: number }[]): number {
        if (ratings.length === 0) return 0;
        const sum = ratings.reduce((acc, rating) => acc + rating.rating, 0);
        return Math.round((sum / ratings.length) * 10) / 10; // Round to 1 decimal place
    }

    private sortServices(services: any[], sortBy: string, sortOrder: 'asc' | 'desc' = 'desc'): any[] {
        const order = sortOrder === 'asc' ? 1 : -1;

        switch (sortBy) {
            case 'price':
                return services.sort((a, b) => (a.priceRange.min - b.priceRange.min) * order);
            case 'rating':
                return services.sort((a, b) => (a.averageRating - b.averageRating) * order);
            case 'name':
                return services.sort((a, b) => a.title.localeCompare(b.title) * order);
            case 'popularity':
                return services.sort((a, b) => (a.totalProviders - b.totalProviders) * order);
            default:
                return services;
        }
    }

    private sortProviders(providers: any[], sortBy: string, sortOrder: 'asc' | 'desc' = 'desc'): any[] {
        const order = sortOrder === 'asc' ? 1 : -1;

        switch (sortBy) {
            case 'price':
                return providers.sort((a, b) => (a.priceRange.min - b.priceRange.min) * order);
            case 'rating':
                return providers.sort((a, b) => (a.averageRating - b.averageRating) * order);
            case 'name':
                return providers.sort((a, b) => a.name.localeCompare(b.name) * order);
            case 'popularity':
                return providers.sort((a, b) => (a.orderCount - b.orderCount) * order);
            default:
                return providers;
        }
    }
} 
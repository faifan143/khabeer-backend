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
}

@Injectable()
export class SearchService {
    constructor(private readonly prisma: PrismaService) { }

    async searchServices(filters: SearchFilters) {
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

        // Text search
        if (filters.query) {
            where.OR = [
                { title: { contains: filters.query, mode: 'insensitive' } },
                { description: { contains: filters.query, mode: 'insensitive' } }
            ];
        }

        // Category filter
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

        // Apply price and rating filters
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

                return true;
            });

            return {
                ...service,
                providerServices: activeProviders
            };
        });

        // Remove services with no active providers
        filteredServices = filteredServices.filter(service => service.providerServices.length > 0);

        return filteredServices;
    }

    async searchProviders(filters: SearchFilters) {
        const where: any = {
            isActive: true,
            providerServices: {
                some: {
                    isActive: true
                }
            }
        };

        // Text search
        if (filters.query) {
            where.OR = [
                { name: { contains: filters.query, mode: 'insensitive' } },
                { description: { contains: filters.query, mode: 'insensitive' } }
            ];
        }

        // Verification filter
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

        // Apply price and rating filters
        let filteredProviders = providers.map(provider => {
            const activeServices = provider.providerServices.filter(ps => {
                // Price filter
                if (filters.minPrice && ps.price < filters.minPrice) return false;
                if (filters.maxPrice && ps.price > filters.maxPrice) return false;

                // Category filter
                if (filters.categoryId && ps.service.categoryId !== filters.categoryId) return false;

                return true;
            });

            return {
                ...provider,
                providerServices: activeServices,
                averageRating: this.calculateAverageRating(provider.ratings)
            };
        });

        // Rating filter
        if (filters.minRating && filters.minRating > 0) {
            filteredProviders = filteredProviders.filter(provider =>
                provider.averageRating >= filters.minRating!
            );
        }

        // Remove providers with no active services
        filteredProviders = filteredProviders.filter(provider => provider.providerServices.length > 0);

        return filteredProviders;
    }

    async searchByLocation(location: string) {
        // For now, we'll search by state. In a real implementation, you'd use geocoding
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

    async getPopularServices(limit: number = 10) {
        const services = await this.prisma.service.findMany({
            include: {
                category: true,
                orders: {
                    where: {
                        status: 'completed',
                        orderDate: {
                            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
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

        // Sort by number of orders
        const sortedServices = services
            .map(service => ({
                ...service,
                orderCount: service.orders.length
            }))
            .sort((a, b) => b.orderCount - a.orderCount)
            .slice(0, limit);

        return sortedServices;
    }

    async getTopRatedProviders(limit: number = 10) {
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

    private calculateAverageRating(ratings: { rating: number }[]): number {
        if (ratings.length === 0) return 0;
        const sum = ratings.reduce((acc, rating) => acc + rating.rating, 0);
        return Math.round((sum / ratings.length) * 10) / 10; // Round to 1 decimal place
    }
} 
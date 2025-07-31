import { PrismaService } from '../prisma/prisma.service';
export interface SearchFilters {
    query?: string;
    categoryId?: number;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    location?: string;
    isVerified?: boolean;
    availability?: string;
    sortBy?: string;
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
export declare class SearchService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    searchServices(filters: SearchFilters): Promise<SearchResult<any>>;
    searchProviders(filters: SearchFilters): Promise<SearchResult<any>>;
    searchByLocation(location: string, radius?: number): Promise<any[]>;
    getPopularServices(limit?: number, days?: number): Promise<any[]>;
    getTopRatedProviders(limit?: number, minReviews?: number): Promise<any[]>;
    getSearchSuggestions(query: string, limit?: number): Promise<any>;
    searchServicesWithPagination(filters: SearchFilters, page?: number, limit?: number): Promise<any>;
    getTrendingServices(limit?: number): Promise<any[]>;
    private checkProviderAvailability;
    private calculatePriceRange;
    private calculateServiceAverageRating;
    private calculateDistance;
    private calculateAverageRating;
    private sortServices;
    private sortProviders;
}

import { PipeTransform, ArgumentMetadata } from '@nestjs/common';
import { SearchService } from './search.service';
export declare class OptionalIntPipe implements PipeTransform {
    transform(value: any, metadata: ArgumentMetadata): number | undefined;
}
export declare class SearchController {
    private readonly searchService;
    constructor(searchService: SearchService);
    searchServices(query?: string, categoryId?: number, minPrice?: number, maxPrice?: number, minRating?: number, isVerified?: string): Promise<import("./search.service").SearchResult<any>>;
    searchProviders(query?: string, categoryId?: number, minPrice?: number, maxPrice?: number, minRating?: number, isVerified?: string): Promise<import("./search.service").SearchResult<any>>;
    searchByLocation(location: string): Promise<any[]>;
    getPopularServices(limit?: number): Promise<any[]>;
    getTopRatedProviders(limit?: number): Promise<any[]>;
    getSearchSuggestions(query: string, limit?: number): Promise<any>;
    getTrendingServices(limit?: number): Promise<any[]>;
    searchServicesPaginated(query?: string, categoryId?: number, minPrice?: number, maxPrice?: number, minRating?: number, isVerified?: boolean, page?: number, limit?: number): Promise<any>;
    searchProvidersPaginated(query?: string, categoryId?: number, minPrice?: number, maxPrice?: number, minRating?: number, isVerified?: boolean, page?: number, limit?: number): Promise<import("./search.service").SearchResult<any>>;
}

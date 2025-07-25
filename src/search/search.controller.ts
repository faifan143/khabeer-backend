import { Controller, Get, Query, ParseIntPipe, PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { SearchService, SearchFilters } from './search.service';

@Injectable()
export class OptionalIntPipe implements PipeTransform {
    transform(value: any, metadata: ArgumentMetadata) {
        if (value === undefined || value === null || value === '') {
            return undefined;
        }
        const parsed = parseInt(value, 10);
        return isNaN(parsed) ? undefined : parsed;
    }
}

@Controller('search')
export class SearchController {
    constructor(private readonly searchService: SearchService) { }

    @Get('services')
    async searchServices(
        @Query('q') query?: string,
        @Query('categoryId', new OptionalIntPipe()) categoryId?: number,
        @Query('minPrice', new OptionalIntPipe()) minPrice?: number,
        @Query('maxPrice', new OptionalIntPipe()) maxPrice?: number,
        @Query('minRating', new OptionalIntPipe()) minRating?: number,
        @Query('isVerified') isVerified?: string
    ) {
        const filters: SearchFilters = {
            query,
            categoryId,
            minPrice,
            maxPrice,
            minRating,
            isVerified: isVerified === 'true'
        };

        return this.searchService.searchServices(filters);
    }

    @Get('providers')
    async searchProviders(
        @Query('q') query?: string,
        @Query('categoryId', new OptionalIntPipe()) categoryId?: number,
        @Query('minPrice', new OptionalIntPipe()) minPrice?: number,
        @Query('maxPrice', new OptionalIntPipe()) maxPrice?: number,
        @Query('minRating', new OptionalIntPipe()) minRating?: number,
        @Query('isVerified') isVerified?: string
    ) {
        const filters: SearchFilters = {
            query,
            categoryId,
            minPrice,
            maxPrice,
            minRating,
            isVerified: isVerified === 'true'
        };

        return this.searchService.searchProviders(filters);
    }

    @Get('location')
    async searchByLocation(@Query('location') location: string) {
        return this.searchService.searchByLocation(location);
    }

    @Get('popular/services')
    async getPopularServices(
        @Query('limit', new OptionalIntPipe()) limit?: number
    ) {
        return this.searchService.getPopularServices(limit);
    }

    @Get('top-rated/providers')
    async getTopRatedProviders(
        @Query('limit', new OptionalIntPipe()) limit?: number
    ) {
        return this.searchService.getTopRatedProviders(limit);
    }
} 
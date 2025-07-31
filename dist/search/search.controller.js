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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchController = exports.OptionalIntPipe = void 0;
const common_1 = require("@nestjs/common");
const search_service_1 = require("./search.service");
let OptionalIntPipe = class OptionalIntPipe {
    transform(value, metadata) {
        if (value === undefined || value === null || value === '') {
            return undefined;
        }
        const parsed = parseInt(value, 10);
        return isNaN(parsed) ? undefined : parsed;
    }
};
exports.OptionalIntPipe = OptionalIntPipe;
exports.OptionalIntPipe = OptionalIntPipe = __decorate([
    (0, common_1.Injectable)()
], OptionalIntPipe);
let SearchController = class SearchController {
    searchService;
    constructor(searchService) {
        this.searchService = searchService;
    }
    async searchServices(query, categoryId, minPrice, maxPrice, minRating, isVerified) {
        const filters = {
            query,
            categoryId,
            minPrice,
            maxPrice,
            minRating,
            isVerified: isVerified === 'true'
        };
        return this.searchService.searchServices(filters);
    }
    async searchProviders(query, categoryId, minPrice, maxPrice, minRating, isVerified) {
        const filters = {
            query,
            categoryId,
            minPrice,
            maxPrice,
            minRating,
            isVerified: isVerified === 'true'
        };
        return this.searchService.searchProviders(filters);
    }
    async searchByLocation(location) {
        return this.searchService.searchByLocation(location);
    }
    async getPopularServices(limit) {
        return this.searchService.getPopularServices(limit);
    }
    async getTopRatedProviders(limit) {
        return this.searchService.getTopRatedProviders(limit);
    }
    async getSearchSuggestions(query, limit) {
        return this.searchService.getSearchSuggestions(query, limit || 5);
    }
    async getTrendingServices(limit) {
        return this.searchService.getTrendingServices(limit || 10);
    }
    async searchServicesPaginated(query, categoryId, minPrice, maxPrice, minRating, isVerified, page, limit) {
        const filters = {
            query,
            categoryId,
            minPrice,
            maxPrice,
            minRating,
            isVerified: isVerified === true
        };
        return this.searchService.searchServicesWithPagination(filters, page || 1, limit || 10);
    }
    async searchProvidersPaginated(query, categoryId, minPrice, maxPrice, minRating, isVerified, page, limit) {
        const filters = {
            query,
            categoryId,
            minPrice,
            maxPrice,
            minRating,
            isVerified: isVerified === true
        };
        return this.searchService.searchProviders(filters);
    }
};
exports.SearchController = SearchController;
__decorate([
    (0, common_1.Get)('services'),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, common_1.Query)('categoryId', new OptionalIntPipe())),
    __param(2, (0, common_1.Query)('minPrice', new OptionalIntPipe())),
    __param(3, (0, common_1.Query)('maxPrice', new OptionalIntPipe())),
    __param(4, (0, common_1.Query)('minRating', new OptionalIntPipe())),
    __param(5, (0, common_1.Query)('isVerified')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number, Number, Number, String]),
    __metadata("design:returntype", Promise)
], SearchController.prototype, "searchServices", null);
__decorate([
    (0, common_1.Get)('providers'),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, common_1.Query)('categoryId', new OptionalIntPipe())),
    __param(2, (0, common_1.Query)('minPrice', new OptionalIntPipe())),
    __param(3, (0, common_1.Query)('maxPrice', new OptionalIntPipe())),
    __param(4, (0, common_1.Query)('minRating', new OptionalIntPipe())),
    __param(5, (0, common_1.Query)('isVerified')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number, Number, Number, String]),
    __metadata("design:returntype", Promise)
], SearchController.prototype, "searchProviders", null);
__decorate([
    (0, common_1.Get)('location'),
    __param(0, (0, common_1.Query)('location')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SearchController.prototype, "searchByLocation", null);
__decorate([
    (0, common_1.Get)('popular/services'),
    __param(0, (0, common_1.Query)('limit', new OptionalIntPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], SearchController.prototype, "getPopularServices", null);
__decorate([
    (0, common_1.Get)('top-rated/providers'),
    __param(0, (0, common_1.Query)('limit', new OptionalIntPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], SearchController.prototype, "getTopRatedProviders", null);
__decorate([
    (0, common_1.Get)('suggestions'),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], SearchController.prototype, "getSearchSuggestions", null);
__decorate([
    (0, common_1.Get)('trending'),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], SearchController.prototype, "getTrendingServices", null);
__decorate([
    (0, common_1.Get)('services/paginated'),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, common_1.Query)('categoryId')),
    __param(2, (0, common_1.Query)('minPrice')),
    __param(3, (0, common_1.Query)('maxPrice')),
    __param(4, (0, common_1.Query)('minRating')),
    __param(5, (0, common_1.Query)('isVerified')),
    __param(6, (0, common_1.Query)('page')),
    __param(7, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number, Number, Number, Boolean, Number, Number]),
    __metadata("design:returntype", Promise)
], SearchController.prototype, "searchServicesPaginated", null);
__decorate([
    (0, common_1.Get)('providers/paginated'),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, common_1.Query)('categoryId')),
    __param(2, (0, common_1.Query)('minPrice')),
    __param(3, (0, common_1.Query)('maxPrice')),
    __param(4, (0, common_1.Query)('minRating')),
    __param(5, (0, common_1.Query)('isVerified')),
    __param(6, (0, common_1.Query)('page')),
    __param(7, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number, Number, Number, Boolean, Number, Number]),
    __metadata("design:returntype", Promise)
], SearchController.prototype, "searchProvidersPaginated", null);
exports.SearchController = SearchController = __decorate([
    (0, common_1.Controller)('search'),
    __metadata("design:paramtypes", [search_service_1.SearchService])
], SearchController);
//# sourceMappingURL=search.controller.js.map
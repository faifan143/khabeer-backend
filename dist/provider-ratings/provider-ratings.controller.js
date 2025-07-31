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
exports.ProviderRatingsController = void 0;
const common_1 = require("@nestjs/common");
const provider_ratings_service_1 = require("./provider-ratings.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
let ProviderRatingsController = class ProviderRatingsController {
    providerRatingsService;
    constructor(providerRatingsService) {
        this.providerRatingsService = providerRatingsService;
    }
    async create(createRatingDto, req) {
        return this.providerRatingsService.create(req.user.userId, createRatingDto);
    }
    async findAll(providerId) {
        const providerIdNum = providerId ? parseInt(providerId, 10) : undefined;
        return this.providerRatingsService.findAll(providerIdNum);
    }
    async findByProvider(providerId) {
        return this.providerRatingsService.findByProvider(providerId);
    }
    async getTopRatedProviders(limit) {
        const limitNum = limit ? parseInt(limit, 10) : 10;
        return this.providerRatingsService.getTopRatedProviders(limitNum);
    }
    async getMyRatings(req) {
        return this.providerRatingsService.getUserRatings(req.user.userId);
    }
    async findOne(id) {
        return this.providerRatingsService.findOne(id);
    }
    async update(id, updateRatingDto, req) {
        return this.providerRatingsService.update(id, req.user.userId, updateRatingDto);
    }
    async remove(id, req) {
        return this.providerRatingsService.remove(id, req.user.userId);
    }
};
exports.ProviderRatingsController = ProviderRatingsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('USER'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProviderRatingsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('providerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProviderRatingsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('provider/:providerId'),
    __param(0, (0, common_1.Param)('providerId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ProviderRatingsController.prototype, "findByProvider", null);
__decorate([
    (0, common_1.Get)('top-rated'),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProviderRatingsController.prototype, "getTopRatedProviders", null);
__decorate([
    (0, common_1.Get)('my-ratings'),
    (0, roles_decorator_1.Roles)('USER'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProviderRatingsController.prototype, "getMyRatings", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ProviderRatingsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)('USER'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", Promise)
], ProviderRatingsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('USER'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ProviderRatingsController.prototype, "remove", null);
exports.ProviderRatingsController = ProviderRatingsController = __decorate([
    (0, common_1.Controller)('provider-ratings'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [provider_ratings_service_1.ProviderRatingsService])
], ProviderRatingsController);
//# sourceMappingURL=provider-ratings.controller.js.map
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
exports.OffersController = void 0;
const common_1 = require("@nestjs/common");
const offers_service_1 = require("./offers.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
let OffersController = class OffersController {
    offersService;
    constructor(offersService) {
        this.offersService = offersService;
    }
    async create(createOfferDto, req) {
        return this.offersService.create(req.user.userId, createOfferDto);
    }
    async findAll(providerId, serviceId, activeOnly) {
        const providerIdNum = providerId ? parseInt(providerId, 10) : undefined;
        const serviceIdNum = serviceId ? parseInt(serviceId, 10) : undefined;
        const activeOnlyBool = activeOnly !== 'false';
        return this.offersService.findAll(providerIdNum, serviceIdNum, activeOnlyBool);
    }
    async getActiveOffers(limit) {
        const limitNum = limit ? parseInt(limit, 10) : 20;
        return this.offersService.getActiveOffers(limitNum);
    }
    async getProviderOffers(providerId) {
        return this.offersService.getProviderOffers(providerId);
    }
    async getMyOffers(req) {
        return this.offersService.getProviderOffers(req.user.userId);
    }
    async findOne(id) {
        return this.offersService.findOne(id);
    }
    async update(id, updateOfferDto, req) {
        return this.offersService.update(id, req.user.userId, updateOfferDto);
    }
    async remove(id, req) {
        return this.offersService.remove(id, req.user.userId);
    }
    async deactivateExpiredOffers() {
        return this.offersService.deactivateExpiredOffers();
    }
};
exports.OffersController = OffersController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('PROVIDER'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], OffersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('providerId')),
    __param(1, (0, common_1.Query)('serviceId')),
    __param(2, (0, common_1.Query)('activeOnly')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], OffersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('active'),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OffersController.prototype, "getActiveOffers", null);
__decorate([
    (0, common_1.Get)('provider/:providerId'),
    __param(0, (0, common_1.Param)('providerId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], OffersController.prototype, "getProviderOffers", null);
__decorate([
    (0, common_1.Get)('my-offers'),
    (0, roles_decorator_1.Roles)('PROVIDER'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OffersController.prototype, "getMyOffers", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], OffersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)('PROVIDER'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", Promise)
], OffersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('PROVIDER'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], OffersController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('deactivate-expired'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OffersController.prototype, "deactivateExpiredOffers", null);
exports.OffersController = OffersController = __decorate([
    (0, common_1.Controller)('offers'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [offers_service_1.OffersService])
], OffersController);
//# sourceMappingURL=offers.controller.js.map
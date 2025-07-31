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
exports.ProviderServiceController = void 0;
const common_1 = require("@nestjs/common");
const provider_service_service_1 = require("./provider-service.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
let ProviderServiceController = class ProviderServiceController {
    providerServiceService;
    constructor(providerServiceService) {
        this.providerServiceService = providerServiceService;
    }
    async create(createProviderServiceDto, req) {
        return this.providerServiceService.create(req.user.userId, createProviderServiceDto);
    }
    async addMultipleServices(addServicesDto, req) {
        return this.providerServiceService.addMultipleServices(req.user.userId, addServicesDto);
    }
    async findAll(providerId, activeOnly) {
        const providerIdNum = providerId ? parseInt(providerId, 10) : undefined;
        const activeOnlyBool = activeOnly === 'true';
        return this.providerServiceService.findAll(providerIdNum, activeOnlyBool);
    }
    async findByProvider(providerId, activeOnly) {
        const activeOnlyBool = activeOnly === 'true';
        return this.providerServiceService.findByProvider(providerId, activeOnlyBool);
    }
    async getMyServices(req, activeOnly) {
        const activeOnlyBool = activeOnly === 'true';
        return this.providerServiceService.findByProvider(req.user.userId, activeOnlyBool);
    }
    async getServiceStats(req) {
        return this.providerServiceService.getServiceStats(req.user.userId);
    }
    async findOne(id) {
        return this.providerServiceService.findOne(id);
    }
    async update(id, updateProviderServiceDto, req) {
        return this.providerServiceService.update(id, req.user.userId, updateProviderServiceDto);
    }
    async toggleServiceStatus(id, req) {
        return this.providerServiceService.toggleServiceStatus(id, req.user.userId);
    }
    async remove(id, req) {
        return this.providerServiceService.remove(id, req.user.userId);
    }
    async removeMultipleServices(body, req) {
        return this.providerServiceService.removeMultipleServices(req.user.userId, body.serviceIds);
    }
};
exports.ProviderServiceController = ProviderServiceController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('PROVIDER'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProviderServiceController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('add-multiple'),
    (0, roles_decorator_1.Roles)('PROVIDER'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProviderServiceController.prototype, "addMultipleServices", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('providerId')),
    __param(1, (0, common_1.Query)('activeOnly')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ProviderServiceController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('provider/:providerId'),
    __param(0, (0, common_1.Param)('providerId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('activeOnly')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], ProviderServiceController.prototype, "findByProvider", null);
__decorate([
    (0, common_1.Get)('my-services'),
    (0, roles_decorator_1.Roles)('PROVIDER'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('activeOnly')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ProviderServiceController.prototype, "getMyServices", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, roles_decorator_1.Roles)('PROVIDER'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProviderServiceController.prototype, "getServiceStats", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ProviderServiceController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)('PROVIDER'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", Promise)
], ProviderServiceController.prototype, "update", null);
__decorate([
    (0, common_1.Put)(':id/toggle'),
    (0, roles_decorator_1.Roles)('PROVIDER'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ProviderServiceController.prototype, "toggleServiceStatus", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('PROVIDER'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ProviderServiceController.prototype, "remove", null);
__decorate([
    (0, common_1.Delete)('remove-multiple'),
    (0, roles_decorator_1.Roles)('PROVIDER'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProviderServiceController.prototype, "removeMultipleServices", null);
exports.ProviderServiceController = ProviderServiceController = __decorate([
    (0, common_1.Controller)('provider-service'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [provider_service_service_1.ProviderServiceService])
], ProviderServiceController);
//# sourceMappingURL=provider-service.controller.js.map
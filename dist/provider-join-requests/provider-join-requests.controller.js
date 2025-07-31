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
exports.ProviderJoinRequestsController = void 0;
const common_1 = require("@nestjs/common");
const provider_join_requests_service_1 = require("./provider-join-requests.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
let ProviderJoinRequestsController = class ProviderJoinRequestsController {
    providerJoinRequestsService;
    constructor(providerJoinRequestsService) {
        this.providerJoinRequestsService = providerJoinRequestsService;
    }
    async create(createJoinRequestDto, req) {
        return this.providerJoinRequestsService.create(req.user.userId, createJoinRequestDto);
    }
    async findAll(status) {
        return this.providerJoinRequestsService.findAll(status);
    }
    async getPendingRequests() {
        return this.providerJoinRequestsService.getPendingRequests();
    }
    async getRequestStats() {
        return this.providerJoinRequestsService.getRequestStats();
    }
    async getMyRequests(req) {
        return this.providerJoinRequestsService.findByProvider(req.user.userId);
    }
    async getProviderRequests(providerId) {
        return this.providerJoinRequestsService.findByProvider(providerId);
    }
    async findOne(id) {
        return this.providerJoinRequestsService.findOne(id);
    }
    async update(id, updateJoinRequestDto) {
        return this.providerJoinRequestsService.update(id, updateJoinRequestDto);
    }
    async approveRequest(id, body) {
        return this.providerJoinRequestsService.approveRequest(id, body.adminNotes);
    }
    async rejectRequest(id, body) {
        return this.providerJoinRequestsService.rejectRequest(id, body.adminNotes);
    }
    async remove(id) {
        return this.providerJoinRequestsService.remove(id);
    }
};
exports.ProviderJoinRequestsController = ProviderJoinRequestsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('PROVIDER'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProviderJoinRequestsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProviderJoinRequestsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('pending'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProviderJoinRequestsController.prototype, "getPendingRequests", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProviderJoinRequestsController.prototype, "getRequestStats", null);
__decorate([
    (0, common_1.Get)('my-requests'),
    (0, roles_decorator_1.Roles)('PROVIDER'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProviderJoinRequestsController.prototype, "getMyRequests", null);
__decorate([
    (0, common_1.Get)('provider/:providerId'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, common_1.Param)('providerId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ProviderJoinRequestsController.prototype, "getProviderRequests", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ProviderJoinRequestsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ProviderJoinRequestsController.prototype, "update", null);
__decorate([
    (0, common_1.Put)(':id/approve'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ProviderJoinRequestsController.prototype, "approveRequest", null);
__decorate([
    (0, common_1.Put)(':id/reject'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ProviderJoinRequestsController.prototype, "rejectRequest", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ProviderJoinRequestsController.prototype, "remove", null);
exports.ProviderJoinRequestsController = ProviderJoinRequestsController = __decorate([
    (0, common_1.Controller)('provider-join-requests'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [provider_join_requests_service_1.ProviderJoinRequestsService])
], ProviderJoinRequestsController);
//# sourceMappingURL=provider-join-requests.controller.js.map
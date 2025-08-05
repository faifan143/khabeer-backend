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
exports.ProviderVerificationController = void 0;
const common_1 = require("@nestjs/common");
const provider_verification_service_1 = require("./provider-verification.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
let ProviderVerificationController = class ProviderVerificationController {
    providerVerificationService;
    constructor(providerVerificationService) {
        this.providerVerificationService = providerVerificationService;
    }
    async create(createVerificationDto, req) {
        return this.providerVerificationService.create(req.user.userId, createVerificationDto);
    }
    async findAll(status) {
        return this.providerVerificationService.findAll(status);
    }
    async getPendingVerifications() {
        return this.providerVerificationService.getPendingVerifications();
    }
    async getVerificationStats() {
        return this.providerVerificationService.getVerificationStats();
    }
    async getMyVerification(req) {
        return this.providerVerificationService.findByProvider(req.user.userId);
    }
    async getProviderVerification(providerId) {
        return this.providerVerificationService.findByProvider(providerId);
    }
    async addDocumentsAdmin(providerId, body) {
        return this.providerVerificationService.addDocumentsAdmin(providerId, body.documents);
    }
    async removeDocumentAdmin(providerId, body) {
        return this.providerVerificationService.removeDocumentAdmin(providerId, body.documentUrl);
    }
    async approveVerificationAdmin(providerId, body) {
        return this.providerVerificationService.approveVerificationByProviderId(providerId, body.adminNotes);
    }
    async rejectVerificationAdmin(providerId, body) {
        return this.providerVerificationService.rejectVerificationByProviderId(providerId, body.adminNotes);
    }
    async findOne(id) {
        return this.providerVerificationService.findOne(id);
    }
    async update(id, updateVerificationDto) {
        return this.providerVerificationService.update(id, updateVerificationDto);
    }
    async approveVerification(id, body) {
        return this.providerVerificationService.approveVerification(id, body.adminNotes);
    }
    async rejectVerification(id, body) {
        return this.providerVerificationService.rejectVerification(id, body.adminNotes);
    }
    async addDocuments(id, body, req) {
        return this.providerVerificationService.addDocuments(id, req.user.userId, body.documents);
    }
    async removeDocument(id, body, req) {
        return this.providerVerificationService.removeDocument(id, req.user.userId, body.documentUrl);
    }
    async remove(id) {
        return this.providerVerificationService.remove(id);
    }
};
exports.ProviderVerificationController = ProviderVerificationController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('PROVIDER'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProviderVerificationController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProviderVerificationController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('pending'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProviderVerificationController.prototype, "getPendingVerifications", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProviderVerificationController.prototype, "getVerificationStats", null);
__decorate([
    (0, common_1.Get)('my-verification'),
    (0, roles_decorator_1.Roles)('PROVIDER'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProviderVerificationController.prototype, "getMyVerification", null);
__decorate([
    (0, common_1.Get)('provider/:providerId'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, common_1.Param)('providerId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ProviderVerificationController.prototype, "getProviderVerification", null);
__decorate([
    (0, common_1.Put)('admin/:providerId/documents'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, common_1.Param)('providerId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ProviderVerificationController.prototype, "addDocumentsAdmin", null);
__decorate([
    (0, common_1.Delete)('admin/:providerId/documents'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, common_1.Param)('providerId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ProviderVerificationController.prototype, "removeDocumentAdmin", null);
__decorate([
    (0, common_1.Put)('admin/:providerId/approve'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, common_1.Param)('providerId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ProviderVerificationController.prototype, "approveVerificationAdmin", null);
__decorate([
    (0, common_1.Put)('admin/:providerId/reject'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, common_1.Param)('providerId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ProviderVerificationController.prototype, "rejectVerificationAdmin", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProviderVerificationController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProviderVerificationController.prototype, "update", null);
__decorate([
    (0, common_1.Put)(':id/approve'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProviderVerificationController.prototype, "approveVerification", null);
__decorate([
    (0, common_1.Put)(':id/reject'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProviderVerificationController.prototype, "rejectVerification", null);
__decorate([
    (0, common_1.Put)(':id/add-documents'),
    (0, roles_decorator_1.Roles)('PROVIDER'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ProviderVerificationController.prototype, "addDocuments", null);
__decorate([
    (0, common_1.Put)(':id/remove-document'),
    (0, roles_decorator_1.Roles)('PROVIDER'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ProviderVerificationController.prototype, "removeDocument", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProviderVerificationController.prototype, "remove", null);
exports.ProviderVerificationController = ProviderVerificationController = __decorate([
    (0, common_1.Controller)('provider-verification'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [provider_verification_service_1.ProviderVerificationService])
], ProviderVerificationController);
//# sourceMappingURL=provider-verification.controller.js.map
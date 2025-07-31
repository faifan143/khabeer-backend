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
exports.ProvidersController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const files_service_1 = require("../files/files.service");
const providers_service_1 = require("./providers.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const roles_guard_1 = require("../auth/roles.guard");
const create_provider_dto_1 = require("./dto/create-provider.dto");
const update_provider_dto_1 = require("./dto/update-provider.dto");
const update_status_dto_1 = require("./dto/update-status.dto");
const multer_1 = require("multer");
const path_1 = require("path");
let ProvidersController = class ProvidersController {
    providersService;
    filesService;
    constructor(providersService, filesService) {
        this.providersService = providersService;
        this.filesService = filesService;
    }
    async findAll() {
        return this.providersService.findAll();
    }
    async findOne(id) {
        return this.providersService.findById(Number(id));
    }
    async getStatus(id, req) {
        if (req.user.role === 'PROVIDER' && req.user.userId !== Number(id)) {
            throw new common_1.BadRequestException('You can only access your own status');
        }
        const provider = await this.providersService.findById(Number(id));
        return { isActive: provider.isActive };
    }
    async register(data, file) {
        if (file) {
            const fileResult = await this.filesService.handleUploadedFile(file);
            data.image = fileResult.url;
        }
        else {
            data.image = '';
        }
        if (typeof data.serviceIds === 'string') {
            data.serviceIds = [parseInt(data.serviceIds, 10)];
        }
        else if (Array.isArray(data.serviceIds)) {
            data.serviceIds = data.serviceIds.map(id => typeof id === 'string' ? parseInt(id, 10) : id);
        }
        if (!data.serviceIds)
            data.serviceIds = [];
        data.name = data.name || '';
        data.description = data.description || '';
        data.state = data.state || '';
        data.phone = data.phone || '';
        return this.providersService.registerProviderWithServices(data);
    }
    async create(createProviderDto, file) {
        const data = { ...createProviderDto };
        if (file) {
            const fileResult = await this.filesService.handleUploadedFile(file);
            data.image = fileResult.url;
        }
        else {
            data.image = '';
        }
        return this.providersService.create(data);
    }
    async update(id, data) {
        return this.providersService.update(Number(id), data);
    }
    async updateStatus(id, data, req) {
        if (req.user.role === 'PROVIDER' && req.user.userId !== Number(id)) {
            throw new common_1.BadRequestException('You can only update your own status');
        }
        return this.providersService.updateStatus(Number(id), data.isActive);
    }
    async remove(id) {
        return this.providersService.remove(Number(id));
    }
    async getProviderServices(id, req) {
        if (req.user.role === 'PROVIDER' && req.user.userId !== Number(id)) {
            throw new common_1.BadRequestException('You can only access your own services');
        }
        return this.providersService.getProviderServices(Number(id));
    }
    async addServices(id, body, req) {
        if (req.user.role === 'PROVIDER' && req.user.userId !== Number(id)) {
            throw new common_1.BadRequestException('You can only modify your own services');
        }
        return this.providersService.addServices(Number(id), body.serviceIds);
    }
    async removeServices(id, body, req) {
        if (req.user.role === 'PROVIDER' && req.user.userId !== Number(id)) {
            throw new common_1.BadRequestException('You can only modify your own services');
        }
        return this.providersService.removeServices(Number(id), body.serviceIds);
    }
};
exports.ProvidersController = ProvidersController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProvidersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProvidersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/status'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('PROVIDER', 'ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProvidersController.prototype, "getStatus", null);
__decorate([
    (0, common_1.Post)('register'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('image')),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_provider_dto_1.CreateProviderDto, Object]),
    __metadata("design:returntype", Promise)
], ProvidersController.prototype, "register", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('image', {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads',
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                const ext = (0, path_1.extname)(file.originalname);
                cb(null, `${uniqueSuffix}${ext}`);
            },
        }),
    })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_provider_dto_1.CreateProviderDto, Object]),
    __metadata("design:returntype", Promise)
], ProvidersController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_provider_dto_1.UpdateProviderDto]),
    __metadata("design:returntype", Promise)
], ProvidersController.prototype, "update", null);
__decorate([
    (0, common_1.Put)(':id/status'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('PROVIDER', 'ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_status_dto_1.UpdateStatusDto, Object]),
    __metadata("design:returntype", Promise)
], ProvidersController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProvidersController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)(':id/services'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('PROVIDER', 'ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProvidersController.prototype, "getProviderServices", null);
__decorate([
    (0, common_1.Post)(':id/services'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('PROVIDER', 'ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ProvidersController.prototype, "addServices", null);
__decorate([
    (0, common_1.Delete)(':id/services'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('PROVIDER', 'ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ProvidersController.prototype, "removeServices", null);
exports.ProvidersController = ProvidersController = __decorate([
    (0, common_1.Controller)('providers'),
    __metadata("design:paramtypes", [providers_service_1.ProvidersService,
        files_service_1.FilesService])
], ProvidersController);
//# sourceMappingURL=providers.controller.js.map
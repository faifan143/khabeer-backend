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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const jwt_auth_guard_1 = require("./jwt-auth.guard");
const login_dto_1 = require("./dto/login.dto");
const multer_1 = require("@nestjs/platform-express/multer");
const files_service_1 = require("../files/files.service");
let AuthController = class AuthController {
    authService;
    filesService;
    constructor(authService, filesService) {
        this.authService = authService;
        this.filesService = filesService;
    }
    async login(body) {
        const user = await this.authService.validateUser(body.email, body.password);
        if (!user) {
            throw new common_1.BadRequestException('Invalid credentials');
        }
        return this.authService.login(user);
    }
    async register(body, file) {
        console.log('Register body:', body);
        if (!body.email || !body.password || !body.name) {
            throw new common_1.BadRequestException('Email, password, and name are required');
        }
        const registerData = {
            name: Array.isArray(body.name) ? body.name[0] : body.name,
            email: Array.isArray(body.email) ? body.email[0] : body.email,
            password: Array.isArray(body.password) ? body.password[0] : body.password,
            role: Array.isArray(body.role) ? body.role[0] : body.role || 'USER',
            address: Array.isArray(body.address) ? body.address[0] : body.address || '',
            phone: Array.isArray(body.phone) ? body.phone[0] : body.phone || '',
            state: Array.isArray(body.state) ? body.state[0] : body.state || '',
            isActive: body.isActive === 'true' || body.isActive === true,
            officialDocuments: Array.isArray(body.officialDocuments) ? body.officialDocuments[0] : body.officialDocuments,
            description: Array.isArray(body.description) ? body.description[0] : body.description || '',
            serviceIds: this.parseServiceIds(body.serviceIds)
        };
        if (file) {
            registerData.image = await this.filesService.handleUploadedFile(file);
        }
        else {
            registerData.image = '';
        }
        if (body.description || registerData.role === 'PROVIDER') {
            registerData.role = 'PROVIDER';
        }
        return this.authService.register(registerData);
    }
    async me(req) {
        return req.user;
    }
    async upgradeToProvider(req, providerData) {
        return this.authService.upgradeToProvider(req.user.id, providerData);
    }
    async checkAccountStatus(body) {
        return this.authService.checkAccountStatus(body.email);
    }
    async activateAccount(req) {
        return this.authService.activateProviderAccount(req.user.id);
    }
    async deactivateAccount(req) {
        return this.authService.deactivateProviderAccount(req.user.id);
    }
    parseServiceIds(serviceIds) {
        if (!serviceIds)
            return [];
        if (typeof serviceIds === 'string') {
            try {
                const parsed = JSON.parse(serviceIds);
                return Array.isArray(parsed) ? parsed.map(id => Number(id)) : [];
            }
            catch {
                return [Number(serviceIds)];
            }
        }
        if (Array.isArray(serviceIds)) {
            return serviceIds.map(id => Number(id));
        }
        return [];
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('register'),
    (0, common_1.UseInterceptors)((0, multer_1.FileInterceptor)('image')),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('me'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "me", null);
__decorate([
    (0, common_1.Post)('upgrade-to-provider'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "upgradeToProvider", null);
__decorate([
    (0, common_1.Post)('check-status'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "checkAccountStatus", null);
__decorate([
    (0, common_1.Post)('activate-account'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "activateAccount", null);
__decorate([
    (0, common_1.Post)('deactivate-account'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "deactivateAccount", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        files_service_1.FilesService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map
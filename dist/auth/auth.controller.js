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
const register_dto_1 = require("./dto/register.dto");
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
            throw new Error('Invalid credentials');
        }
        return this.authService.login(user);
    }
    async register(body, file) {
        console.log('Register body:', body);
        body.image = file ? await this.filesService.handleUploadedFile(file) : '';
        if (Array.isArray(body.password))
            body.password = body.password[0];
        if (Array.isArray(body.name))
            body.name = body.name[0];
        if (Array.isArray(body.email))
            body.email = body.email[0];
        if (Array.isArray(body.address))
            body.address = body.address[0];
        if (Array.isArray(body.phone))
            body.phone = body.phone[0];
        if (Array.isArray(body.state))
            body.state = body.state[0];
        if (!body.password)
            throw new Error('Password is required');
        body.name = body.name || '';
        body.email = body.email || '';
        body.address = body.address || '';
        body.phone = body.phone || '';
        body.state = body.state || '';
        return this.authService.register(body);
    }
    async me(req) {
        return req.user;
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
    __metadata("design:paramtypes", [register_dto_1.RegisterDto, Object]),
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
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        files_service_1.FilesService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map
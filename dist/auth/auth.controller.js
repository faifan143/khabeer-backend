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
const swagger_1 = require("@nestjs/swagger");
const auth_service_1 = require("./auth.service");
const jwt_auth_guard_1 = require("./jwt-auth.guard");
const login_dto_1 = require("./dto/login.dto");
const phone_login_dto_1 = require("./dto/phone-login.dto");
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
        try {
            const user = await this.authService.validateUser(body.email, body.password);
            if (!user) {
                throw new common_1.BadRequestException('Invalid credentials');
            }
            return this.authService.login(user);
        }
        catch (error) {
            if (error instanceof common_1.UnauthorizedException) {
                throw error;
            }
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException('Invalid credentials');
        }
    }
    async sendPhoneLoginOtp(phoneLoginDto) {
        return this.authService.sendPhoneLoginOtp(phoneLoginDto);
    }
    async verifyPhoneLogin(phoneLoginVerifyDto) {
        return this.authService.verifyPhoneLogin(phoneLoginVerifyDto);
    }
    async directPhoneLogin(directPhoneLoginDto) {
        return this.authService.directPhoneLogin(directPhoneLoginDto);
    }
    async sendPhoneRegistrationOtp(phoneLoginDto) {
        return this.authService.sendPhoneLoginOtp({ ...phoneLoginDto, purpose: 'registration' });
    }
    async registerWithPhone(body, file) {
        console.log('Phone register body:', body);
        if (!body.phoneNumber || !body.otp || !body.name || !body.password) {
            throw new common_1.BadRequestException('Phone number, OTP, name, and password are required');
        }
        const registerData = {
            name: Array.isArray(body.name) ? body.name[0] : body.name,
            email: Array.isArray(body.email) ? body.email[0] : body.email || '',
            password: Array.isArray(body.password) ? body.password[0] : body.password,
            phoneNumber: Array.isArray(body.phoneNumber) ? body.phoneNumber[0] : body.phoneNumber,
            otp: Array.isArray(body.otp) ? body.otp[0] : body.otp,
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
            const fileResult = await this.filesService.handleUploadedFile(file);
            registerData.image = fileResult.url;
        }
        else {
            registerData.image = '';
        }
        if (body.description || registerData.role === 'PROVIDER') {
            registerData.role = 'PROVIDER';
        }
        return this.authService.registerWithPhone(registerData);
    }
    async sendPasswordResetOtp(body) {
        return this.authService.sendPhoneLoginOtp({
            phoneNumber: body.phoneNumber,
            purpose: 'password_reset'
        });
    }
    async resetPasswordWithPhone(body) {
        return this.authService.resetPasswordWithPhone(body.phoneNumber, body.otp, body.newPassword);
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
            const fileResult = await this.filesService.handleUploadedFile(file);
            registerData.image = fileResult.url;
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
        return this.authService.upgradeToProvider(req.user.userId, providerData);
    }
    async checkAccountStatus(body) {
        return this.authService.checkAccountStatus(body.email);
    }
    async activateAccount(req) {
        return this.authService.activateProviderAccount(req.user.userId);
    }
    async deactivateAccount(req) {
        return this.authService.deactivateProviderAccount(req.user.userId);
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
    (0, swagger_1.ApiOperation)({ summary: 'Login with email and password' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Login successful' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid credentials' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('phone/login/send-otp'),
    (0, swagger_1.ApiOperation)({ summary: 'Send OTP for phone-based login' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'OTP sent successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid phone number' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Account not found' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [phone_login_dto_1.PhoneLoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "sendPhoneLoginOtp", null);
__decorate([
    (0, common_1.Post)('phone/login/verify'),
    (0, swagger_1.ApiOperation)({ summary: 'Verify OTP and login with phone' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Login successful', type: phone_login_dto_1.PhoneLoginResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid OTP' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [phone_login_dto_1.PhoneLoginVerifyDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyPhoneLogin", null);
__decorate([
    (0, common_1.Post)('phone/login/direct'),
    (0, swagger_1.ApiOperation)({ summary: 'Direct phone login without OTP (optional password)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Login successful', type: phone_login_dto_1.PhoneLoginResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid credentials' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [phone_login_dto_1.DirectPhoneLoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "directPhoneLogin", null);
__decorate([
    (0, common_1.Post)('phone/register/send-otp'),
    (0, swagger_1.ApiOperation)({ summary: 'Send OTP for phone-based registration' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'OTP sent successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid phone number' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [phone_login_dto_1.PhoneLoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "sendPhoneRegistrationOtp", null);
__decorate([
    (0, common_1.Post)('phone/register'),
    (0, common_1.UseInterceptors)((0, multer_1.FileInterceptor)('image')),
    (0, swagger_1.ApiOperation)({ summary: 'Register with phone verification' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Registration successful' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid data or OTP' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "registerWithPhone", null);
__decorate([
    (0, common_1.Post)('phone/password-reset/send-otp'),
    (0, swagger_1.ApiOperation)({ summary: 'Send OTP for password reset' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'OTP sent successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Account not found' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "sendPasswordResetOtp", null);
__decorate([
    (0, common_1.Post)('phone/password-reset'),
    (0, swagger_1.ApiOperation)({ summary: 'Reset password with phone verification' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Password reset successful' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid OTP or data' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resetPasswordWithPhone", null);
__decorate([
    (0, common_1.Post)('register'),
    (0, common_1.UseInterceptors)((0, multer_1.FileInterceptor)('image')),
    (0, swagger_1.ApiOperation)({ summary: 'Register with email and password' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Registration successful' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid data' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('me'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get current user information' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User information retrieved' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "me", null);
__decorate([
    (0, common_1.Post)('upgrade-to-provider'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Upgrade user account to provider' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Account upgraded successfully' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "upgradeToProvider", null);
__decorate([
    (0, common_1.Post)('check-status'),
    (0, swagger_1.ApiOperation)({ summary: 'Check account status by email' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Account status retrieved' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "checkAccountStatus", null);
__decorate([
    (0, common_1.Post)('activate-account'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Activate provider account' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Account activated successfully' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "activateAccount", null);
__decorate([
    (0, common_1.Post)('deactivate-account'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Deactivate provider account' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Account deactivated successfully' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "deactivateAccount", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('Authentication'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        files_service_1.FilesService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map
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
const register_dto_1 = require("./dto/register.dto");
const password_reset_dto_1 = require("./dto/password-reset.dto");
const multer_1 = require("@nestjs/platform-express/multer");
const multer_2 = require("multer");
const path_1 = require("path");
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
            if (!body.email && !body.phone) {
                throw new common_1.BadRequestException('Either email (for providers) or phone (for users) is required');
            }
            if (body.email && body.phone) {
                throw new common_1.BadRequestException('Please provide either email OR phone, not both');
            }
            const user = await this.authService.validateUser(body);
            if (!user) {
                throw new common_1.BadRequestException('Invalid credentials');
            }
            if (body.fcm) {
                return this.authService.loginWithFCM(user, body.fcm);
            }
            return this.authService.login(user);
        }
        catch (error) {
            console.error('Login error:', error);
            if (error instanceof common_1.UnauthorizedException) {
                throw error;
            }
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException('Invalid credentials');
        }
    }
    async sendPasswordResetOtp(body) {
        return this.authService.sendPasswordResetOtp(body.phoneNumber);
    }
    async resetPasswordWithPhone(body) {
        return this.authService.resetPasswordWithPhone(body.phoneNumber, body.otp, body.newPassword);
    }
    async initiateRegistration(body, file) {
        if (!body.password || !body.name || !body.phoneNumber) {
            throw new common_1.BadRequestException('Password, name, and phone number are required');
        }
        const registerData = {
            registerType: body.registerType || register_dto_1.RegisterType.USER,
            name: Array.isArray(body.name) ? body.name[0] : body.name,
            email: Array.isArray(body.email) ? body.email[0] : body.email,
            password: Array.isArray(body.password) ? body.password[0] : body.password,
            phoneNumber: Array.isArray(body.phoneNumber) ? body.phoneNumber[0] : body.phoneNumber,
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
            const imageUrl = `/uploads/images/users/${file.filename}`;
            registerData.image = imageUrl;
        }
        else {
            registerData.image = '';
        }
        return this.authService.initiateRegistration(registerData);
    }
    async completeRegistration(body) {
        if (!body.phoneNumber || !body.otp) {
            throw new common_1.BadRequestException('Phone number and OTP are required');
        }
        const phoneNumber = Array.isArray(body.phoneNumber) ? body.phoneNumber[0] : body.phoneNumber;
        const otp = Array.isArray(body.otp) ? body.otp[0] : body.otp;
        return this.authService.completeRegistration(phoneNumber, otp);
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
    async checkRegistrationStatus(body) {
        if (!body.phoneNumber) {
            throw new common_1.BadRequestException('Phone number is required');
        }
        return this.authService.checkRegistrationStatus(body.phoneNumber);
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
    (0, swagger_1.ApiOperation)({ summary: 'Login with email (providers) or phone (users) and password' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Login successful' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid credentials or missing required fields' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('phone/password-reset/send-otp'),
    (0, swagger_1.ApiOperation)({ summary: 'Send OTP for password reset' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'OTP sent successfully', type: password_reset_dto_1.PasswordResetResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid phone number or account not found' }),
    (0, swagger_1.ApiResponse)({ status: 429, description: 'Too many OTP requests, please wait' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [password_reset_dto_1.SendPasswordResetOtpDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "sendPasswordResetOtp", null);
__decorate([
    (0, common_1.Post)('phone/password-reset'),
    (0, swagger_1.ApiOperation)({ summary: 'Reset password with phone verification' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Password reset successful', type: password_reset_dto_1.PasswordResetResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid OTP or data' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Account not found' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [password_reset_dto_1.ResetPasswordDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resetPasswordWithPhone", null);
__decorate([
    (0, common_1.Post)('register/initiate'),
    (0, common_1.UseInterceptors)((0, multer_1.FileInterceptor)('image', {
        storage: (0, multer_2.diskStorage)({
            destination: './uploads/images/users',
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                const ext = (0, path_1.extname)(file.originalname);
                cb(null, `user-${uniqueSuffix}${ext}`);
            },
        }),
    })),
    (0, swagger_1.ApiOperation)({ summary: 'Step 1: Initiate registration and send OTP - User provides all data including password' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Registration initiated, OTP sent' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid data or user already exists' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "initiateRegistration", null);
__decorate([
    (0, common_1.Post)('register/complete'),
    (0, swagger_1.ApiOperation)({ summary: 'Step 2: Complete registration with OTP verification - Only phone and OTP required' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Registration completed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid OTP or registration data expired' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "completeRegistration", null);
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
__decorate([
    (0, common_1.Post)('register/check-status'),
    (0, swagger_1.ApiOperation)({ summary: 'Check if registration data exists for a phone number' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Registration status checked' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Phone number required' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "checkRegistrationStatus", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('Authentication'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        files_service_1.FilesService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map
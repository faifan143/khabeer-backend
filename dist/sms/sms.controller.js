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
exports.SmsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const sms_service_1 = require("./sms.service");
const send_sms_dto_1 = require("./dto/send-sms.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
let SmsController = class SmsController {
    smsService;
    constructor(smsService) {
        this.smsService = smsService;
    }
    async sendOtp(sendOtpDto) {
        return this.smsService.sendOtp(sendOtpDto);
    }
    async verifyOtp(verifyOtpDto) {
        return this.smsService.verifyOtp(verifyOtpDto);
    }
    async getSmsStatus() {
        const isConfigured = !!(process.env.TAMIMAH_SMS_API_URL &&
            process.env.TAMIMAH_SMS_USERNAME &&
            process.env.TAMIMAH_SMS_PASSWORD);
        return {
            service: 'Tamimah SMS',
            configured: isConfigured,
            status: isConfigured ? 'ready' : 'not_configured',
            timestamp: new Date().toISOString()
        };
    }
};
exports.SmsController = SmsController;
__decorate([
    (0, common_1.Post)('otp/send'),
    (0, swagger_1.ApiOperation)({ summary: 'Send OTP via SMS' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'OTP sent successfully', type: send_sms_dto_1.OtpResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 429, description: 'Too many requests' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [send_sms_dto_1.SendOtpDto]),
    __metadata("design:returntype", Promise)
], SmsController.prototype, "sendOtp", null);
__decorate([
    (0, common_1.Post)('otp/verify'),
    (0, swagger_1.ApiOperation)({ summary: 'Verify OTP' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'OTP verified successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid or expired OTP' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [send_sms_dto_1.VerifyOtpDto]),
    __metadata("design:returntype", Promise)
], SmsController.prototype, "verifyOtp", null);
__decorate([
    (0, common_1.Get)('status'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Get SMS service status' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'SMS service status' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SmsController.prototype, "getSmsStatus", null);
exports.SmsController = SmsController = __decorate([
    (0, swagger_1.ApiTags)('SMS OTP'),
    (0, common_1.Controller)('sms'),
    __metadata("design:paramtypes", [sms_service_1.SmsService])
], SmsController);
//# sourceMappingURL=sms.controller.js.map
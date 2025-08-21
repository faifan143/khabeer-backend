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
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginDto = exports.LoginType = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
var LoginType;
(function (LoginType) {
    LoginType["USER"] = "user";
    LoginType["PROVIDER"] = "provider";
})(LoginType || (exports.LoginType = LoginType = {}));
class LoginDto {
    loginType;
    identifier;
    password;
    fcm;
}
exports.LoginDto = LoginDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Login type - user (phone) or provider (email)', enum: LoginType }),
    (0, class_validator_1.IsEnum)(LoginType),
    __metadata("design:type", String)
], LoginDto.prototype, "loginType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Phone number (for users) or email (for providers)' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LoginDto.prototype, "identifier", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User password' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LoginDto.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'FCM token for push notifications', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LoginDto.prototype, "fcm", void 0);
//# sourceMappingURL=login.dto.js.map
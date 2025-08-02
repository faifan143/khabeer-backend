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
exports.PhoneLoginResponseDto = exports.DirectPhoneLoginDto = exports.PhoneRegistrationDto = exports.PhoneLoginDto = void 0;
const class_validator_1 = require("class-validator");
class PhoneLoginDto {
    phoneNumber;
    purpose;
}
exports.PhoneLoginDto = PhoneLoginDto;
__decorate([
    (0, class_validator_1.IsPhoneNumber)(),
    __metadata("design:type", String)
], PhoneLoginDto.prototype, "phoneNumber", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PhoneLoginDto.prototype, "purpose", void 0);
class PhoneRegistrationDto {
    phoneNumber;
    otp;
    purpose;
}
exports.PhoneRegistrationDto = PhoneRegistrationDto;
__decorate([
    (0, class_validator_1.IsPhoneNumber)(),
    __metadata("design:type", String)
], PhoneRegistrationDto.prototype, "phoneNumber", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PhoneRegistrationDto.prototype, "otp", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PhoneRegistrationDto.prototype, "purpose", void 0);
class DirectPhoneLoginDto {
    phoneNumber;
    password;
}
exports.DirectPhoneLoginDto = DirectPhoneLoginDto;
__decorate([
    (0, class_validator_1.IsPhoneNumber)(),
    __metadata("design:type", String)
], DirectPhoneLoginDto.prototype, "phoneNumber", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DirectPhoneLoginDto.prototype, "password", void 0);
class PhoneLoginResponseDto {
    success;
    message;
    access_token;
    user;
}
exports.PhoneLoginResponseDto = PhoneLoginResponseDto;
//# sourceMappingURL=phone-login.dto.js.map
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
exports.CreateNotificationDto = exports.TargetAudience = exports.NotificationType = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
var NotificationType;
(function (NotificationType) {
    NotificationType["GENERAL"] = "general";
    NotificationType["ORDER"] = "order";
    NotificationType["OFFER"] = "offer";
    NotificationType["SYSTEM"] = "system";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
var TargetAudience;
(function (TargetAudience) {
    TargetAudience["CUSTOMERS"] = "customers";
    TargetAudience["PROVIDERS"] = "providers";
    TargetAudience["ALL"] = "all";
})(TargetAudience || (exports.TargetAudience = TargetAudience = {}));
class CreateNotificationDto {
    title;
    message;
    imageUrl;
    targetAudience;
    notificationType = NotificationType.GENERAL;
    data;
}
exports.CreateNotificationDto = CreateNotificationDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Notification title' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateNotificationDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Notification message' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateNotificationDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notification image URL' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateNotificationDto.prototype, "imageUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Target audience for the notification',
        enum: TargetAudience,
        isArray: true
    }),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CreateNotificationDto.prototype, "targetAudience", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Type of notification',
        enum: NotificationType,
        default: NotificationType.GENERAL
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(NotificationType),
    __metadata("design:type", String)
], CreateNotificationDto.prototype, "notificationType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Additional data for FCM payload' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateNotificationDto.prototype, "data", void 0);
//# sourceMappingURL=create-notification.dto.js.map
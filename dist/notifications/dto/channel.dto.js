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
exports.BulkSubscriptionDto = exports.UnsubscribeFromChannelDto = exports.SubscribeToChannelDto = exports.CreateChannelDto = exports.SubscriptionAction = exports.ChannelType = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
var ChannelType;
(function (ChannelType) {
    ChannelType["PROVIDERS"] = "providers";
    ChannelType["USERS"] = "users";
})(ChannelType || (exports.ChannelType = ChannelType = {}));
var SubscriptionAction;
(function (SubscriptionAction) {
    SubscriptionAction["SUBSCRIBE"] = "subscribe";
    SubscriptionAction["UNSUBSCRIBE"] = "unsubscribe";
})(SubscriptionAction || (exports.SubscriptionAction = SubscriptionAction = {}));
class CreateChannelDto {
    name;
    type;
    description;
}
exports.CreateChannelDto = CreateChannelDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Channel name' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateChannelDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Channel type', enum: ChannelType }),
    (0, class_validator_1.IsEnum)(ChannelType),
    __metadata("design:type", String)
], CreateChannelDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Channel description' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateChannelDto.prototype, "description", void 0);
class SubscribeToChannelDto {
    fcmToken;
    channel;
}
exports.SubscribeToChannelDto = SubscribeToChannelDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'FCM token to subscribe' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SubscribeToChannelDto.prototype, "fcmToken", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Channel to subscribe to', enum: ChannelType }),
    (0, class_validator_1.IsEnum)(ChannelType),
    __metadata("design:type", String)
], SubscribeToChannelDto.prototype, "channel", void 0);
class UnsubscribeFromChannelDto {
    fcmToken;
    channel;
}
exports.UnsubscribeFromChannelDto = UnsubscribeFromChannelDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'FCM token to unsubscribe' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UnsubscribeFromChannelDto.prototype, "fcmToken", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Channel to unsubscribe from', enum: ChannelType }),
    (0, class_validator_1.IsEnum)(ChannelType),
    __metadata("design:type", String)
], UnsubscribeFromChannelDto.prototype, "channel", void 0);
class BulkSubscriptionDto {
    fcmTokens;
    channel;
    action;
}
exports.BulkSubscriptionDto = BulkSubscriptionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'FCM tokens to subscribe/unsubscribe', type: [String] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], BulkSubscriptionDto.prototype, "fcmTokens", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Channel to subscribe/unsubscribe to', enum: ChannelType }),
    (0, class_validator_1.IsEnum)(ChannelType),
    __metadata("design:type", String)
], BulkSubscriptionDto.prototype, "channel", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Action to perform', enum: SubscriptionAction }),
    (0, class_validator_1.IsEnum)(SubscriptionAction),
    __metadata("design:type", String)
], BulkSubscriptionDto.prototype, "action", void 0);
//# sourceMappingURL=channel.dto.js.map
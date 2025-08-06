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
exports.ChannelController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const channel_service_1 = require("./channel.service");
const channel_init_service_1 = require("./channel-init.service");
const channel_dto_1 = require("./dto/channel.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
let ChannelController = class ChannelController {
    channelService;
    channelInitService;
    constructor(channelService, channelInitService) {
        this.channelService = channelService;
        this.channelInitService = channelInitService;
    }
    async subscribeUserToChannel(userId, subscribeDto) {
        const success = await this.channelService.subscribeUserToChannel(userId, subscribeDto.channel);
        return {
            success,
            message: success ? 'User subscribed to channel successfully' : 'Failed to subscribe user to channel',
        };
    }
    async unsubscribeUserFromChannel(userId, unsubscribeDto) {
        const success = await this.channelService.unsubscribeUserFromChannel(userId, unsubscribeDto.channel);
        return {
            success,
            message: success ? 'User unsubscribed from channel successfully' : 'Failed to unsubscribe user from channel',
        };
    }
    async subscribeProviderToChannel(providerId, subscribeDto) {
        const success = await this.channelService.subscribeProviderToChannel(providerId, subscribeDto.channel);
        return {
            success,
            message: success ? 'Provider subscribed to channel successfully' : 'Failed to subscribe provider to channel',
        };
    }
    async unsubscribeProviderFromChannel(providerId, unsubscribeDto) {
        const success = await this.channelService.unsubscribeProviderFromChannel(providerId, unsubscribeDto.channel);
        return {
            success,
            message: success ? 'Provider unsubscribed from channel successfully' : 'Failed to unsubscribe provider from channel',
        };
    }
    async bulkSubscriptionAction(bulkSubscriptionDto) {
        const success = await this.channelService.bulkSubscriptionAction(bulkSubscriptionDto.fcmTokens, bulkSubscriptionDto.channel, bulkSubscriptionDto.action);
        return {
            success,
            message: success ? 'Bulk subscription action completed successfully' : 'Failed to complete bulk subscription action',
        };
    }
    async subscribeAllUsersToChannel(channel) {
        const result = await this.channelService.subscribeAllUsersToChannel(channel);
        return {
            success: result.success,
            count: result.count,
            message: result.success
                ? `Successfully subscribed ${result.count} users to channel ${channel}`
                : 'Failed to subscribe users to channel',
        };
    }
    async subscribeAllProvidersToChannel(channel) {
        const result = await this.channelService.subscribeAllProvidersToChannel(channel);
        return {
            success: result.success,
            count: result.count,
            message: result.success
                ? `Successfully subscribed ${result.count} providers to channel ${channel}`
                : 'Failed to subscribe providers to channel',
        };
    }
    async sendNotificationToChannel(channel, body) {
        const success = await this.channelService.sendNotificationToChannel(channel, body.title, body.message, body.imageUrl, body.data);
        return {
            success,
            message: success ? 'Notification sent to channel successfully' : 'Failed to send notification to channel',
        };
    }
    async getChannelStatistics() {
        const statistics = await this.channelService.getChannelStatistics();
        return {
            success: true,
            statistics,
        };
    }
    async reinitializeChannels() {
        return await this.channelInitService.reinitializeChannels();
    }
    async healthCheck() {
        return {
            status: 'healthy',
            service: 'channel-service',
            timestamp: new Date().toISOString(),
        };
    }
};
exports.ChannelController = ChannelController;
__decorate([
    (0, common_1.Post)('users/:userId/subscribe'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Subscribe a user to a channel' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User subscribed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Param)('userId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, channel_dto_1.SubscribeToChannelDto]),
    __metadata("design:returntype", Promise)
], ChannelController.prototype, "subscribeUserToChannel", null);
__decorate([
    (0, common_1.Post)('users/:userId/unsubscribe'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Unsubscribe a user from a channel' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User unsubscribed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Param)('userId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, channel_dto_1.UnsubscribeFromChannelDto]),
    __metadata("design:returntype", Promise)
], ChannelController.prototype, "unsubscribeUserFromChannel", null);
__decorate([
    (0, common_1.Post)('providers/:providerId/subscribe'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Subscribe a provider to a channel' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Provider subscribed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Param)('providerId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, channel_dto_1.SubscribeToChannelDto]),
    __metadata("design:returntype", Promise)
], ChannelController.prototype, "subscribeProviderToChannel", null);
__decorate([
    (0, common_1.Post)('providers/:providerId/unsubscribe'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Unsubscribe a provider from a channel' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Provider unsubscribed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Param)('providerId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, channel_dto_1.UnsubscribeFromChannelDto]),
    __metadata("design:returntype", Promise)
], ChannelController.prototype, "unsubscribeProviderFromChannel", null);
__decorate([
    (0, common_1.Post)('bulk-subscription'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Bulk subscribe/unsubscribe FCM tokens to/from a channel' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Bulk subscription action completed' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin access required' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [channel_dto_1.BulkSubscriptionDto]),
    __metadata("design:returntype", Promise)
], ChannelController.prototype, "bulkSubscriptionAction", null);
__decorate([
    (0, common_1.Post)('subscribe-all-users/:channel'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Subscribe all users to a channel' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'All users subscribed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin access required' }),
    __param(0, (0, common_1.Param)('channel')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChannelController.prototype, "subscribeAllUsersToChannel", null);
__decorate([
    (0, common_1.Post)('subscribe-all-providers/:channel'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Subscribe all providers to a channel' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'All providers subscribed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin access required' }),
    __param(0, (0, common_1.Param)('channel')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChannelController.prototype, "subscribeAllProvidersToChannel", null);
__decorate([
    (0, common_1.Post)(':channel/send'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Send notification to a specific channel' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Notification sent to channel successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin access required' }),
    __param(0, (0, common_1.Param)('channel')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ChannelController.prototype, "sendNotificationToChannel", null);
__decorate([
    (0, common_1.Get)('statistics'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get channel statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Channel statistics retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin access required' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ChannelController.prototype, "getChannelStatistics", null);
__decorate([
    (0, common_1.Post)('reinitialize'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Reinitialize channel subscriptions for all users and providers' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Channel subscriptions reinitialized successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin access required' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ChannelController.prototype, "reinitializeChannels", null);
__decorate([
    (0, common_1.Get)('health'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Channel service health check' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Channel service is healthy' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ChannelController.prototype, "healthCheck", null);
exports.ChannelController = ChannelController = __decorate([
    (0, swagger_1.ApiTags)('channels'),
    (0, common_1.Controller)('channels'),
    __metadata("design:paramtypes", [channel_service_1.ChannelService,
        channel_init_service_1.ChannelInitService])
], ChannelController);
//# sourceMappingURL=channel.controller.js.map
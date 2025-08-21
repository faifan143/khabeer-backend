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
exports.NotificationTestController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const fcm_service_1 = require("./fcm.service");
const simple_fcm_service_1 = require("./simple-fcm.service");
const simplified_channel_service_1 = require("./simplified-channel.service");
let NotificationTestController = class NotificationTestController {
    fcmService;
    simpleFCMService;
    simplifiedChannelService;
    constructor(fcmService, simpleFCMService, simplifiedChannelService) {
        this.fcmService = fcmService;
        this.simpleFCMService = simpleFCMService;
        this.simplifiedChannelService = simplifiedChannelService;
    }
    async testAllTopics() {
        try {
            const topics = ['channel_users', 'channel_providers'];
            const results = [];
            for (const topic of topics) {
                const result = await this.fcmService.sendToTopic(topic, {
                    title: '🧪 Topic Test Message',
                    body: `Testing topic: ${topic} - ${new Date().toLocaleTimeString()}`,
                    data: {
                        test: 'true',
                        timestamp: new Date().toISOString(),
                        topic: topic,
                        type: 'topic_test'
                    }
                });
                results.push({
                    topic,
                    success: result.success,
                    messageId: result.messageId,
                    error: result.error,
                    timestamp: new Date().toISOString()
                });
            }
            return {
                message: '🧪 Test messages sent to all topics',
                totalTopics: topics.length,
                results,
                timestamp: new Date().toISOString()
            };
        }
        catch (error) {
            throw new Error(`Failed to send test messages: ${error.message}`);
        }
    }
    async testSpecificTopic(topic, body) {
        const payload = {
            title: body.title || `🧪 Test: ${topic}`,
            body: body.body || `Testing topic ${topic} at ${new Date().toLocaleTimeString()}`,
            data: {
                test: 'true',
                timestamp: new Date().toISOString(),
                topic: topic,
                type: 'topic_test',
                ...body.data
            }
        };
        const result = await this.fcmService.sendToTopic(topic, payload);
        return {
            message: `🧪 Test message sent to topic: ${topic}`,
            topic,
            success: result.success,
            messageId: result.messageId,
            error: result.error,
            payload,
            timestamp: new Date().toISOString()
        };
    }
    async getTopicsInfo() {
        const topics = this.fcmService.getAllTopics();
        const topicInfo = await Promise.all(topics.map(async (topic) => {
            const info = await this.fcmService.getTopicInfo(topic);
            return {
                topicName: topic,
                ...info
            };
        }));
        return {
            message: '📊 Available FCM Topics Information',
            totalTopics: topics.length,
            topics: topicInfo,
            timestamp: new Date().toISOString()
        };
    }
    async testUserToken(userId, body) {
        const payload = {
            title: body.title || '🧪 User Test Notification',
            body: body.body || `Testing FCM token for user ${userId} at ${new Date().toLocaleTimeString()}`,
            data: {
                test: 'true',
                timestamp: new Date().toISOString(),
                userId: userId.toString(),
                type: 'user_token_test',
                ...body.data
            },
            imageUrl: body.imageUrl
        };
        const result = await this.simpleFCMService.sendToUser(userId, payload);
        return {
            message: `🧪 Test notification sent to user ${userId}`,
            userId,
            success: result.success,
            messageId: result.messageId,
            error: result.error,
            payload,
            timestamp: new Date().toISOString()
        };
    }
    async testProviderToken(providerId, body) {
        const payload = {
            title: body.title || '🧪 Provider Test Notification',
            body: body.body || `Testing FCM token for provider ${providerId} at ${new Date().toLocaleTimeString()}`,
            data: {
                test: 'true',
                timestamp: new Date().toISOString(),
                providerId: providerId.toString(),
                type: 'provider_token_test',
                ...body.data
            },
            imageUrl: body.imageUrl
        };
        const result = await this.simpleFCMService.sendToProvider(providerId, payload);
        return {
            message: `🧪 Test notification sent to provider ${providerId}`,
            providerId,
            success: result.success,
            messageId: result.messageId,
            error: result.error,
            payload,
            timestamp: new Date().toISOString()
        };
    }
    async testAllUsersTokens(body) {
        const payload = {
            title: body.title || '🧪 All Users Test Notification',
            body: body.body || `Testing FCM tokens for all users at ${new Date().toLocaleTimeString()}`,
            data: {
                test: 'true',
                timestamp: new Date().toISOString(),
                type: 'all_users_token_test',
                ...body.data
            },
            imageUrl: body.imageUrl
        };
        const result = await this.simpleFCMService.sendToAllUsers(payload);
        return {
            message: '🧪 Test notifications sent to all users with FCM tokens',
            success: result.success,
            sentCount: result.sentCount,
            totalCount: result.totalCount,
            payload,
            timestamp: new Date().toISOString()
        };
    }
    async testAllProvidersTokens(body) {
        const payload = {
            title: body.title || '🧪 All Providers Test Notification',
            body: body.body || `Testing FCM tokens for all providers at ${new Date().toLocaleTimeString()}`,
            data: {
                test: 'true',
                timestamp: new Date().toISOString(),
                type: 'all_providers_token_test',
                ...body.data
            },
            imageUrl: body.imageUrl
        };
        const result = await this.simpleFCMService.sendToAllProviders(payload);
        return {
            message: '🧪 Test notifications sent to all providers with FCM tokens',
            success: result.success,
            sentCount: result.sentCount,
            totalCount: result.totalCount,
            payload,
            timestamp: new Date().toISOString()
        };
    }
    async compareTopicVsToken(body) {
        const payload = {
            title: body.title || '🔄 Comparison Test',
            body: body.body || `Testing topic vs token messaging at ${new Date().toLocaleTimeString()}`,
            data: {
                test: 'true',
                timestamp: new Date().toISOString(),
                type: 'comparison_test',
                ...body.data
            },
            imageUrl: body.imageUrl
        };
        const results = {
            message: '🔄 Topic vs Token messaging comparison test',
            targetAudience: body.targetAudience,
            timestamp: new Date().toISOString(),
            topicResults: {},
            tokenResults: {}
        };
        if (body.targetAudience === 'users' || body.targetAudience === 'both') {
            const topicResult = await this.simplifiedChannelService.sendToUsers(payload.title, payload.body, payload.data, payload.imageUrl);
            results.topicResults.users = {
                success: topicResult,
                method: 'topic-based',
                topic: 'channel_users'
            };
        }
        if (body.targetAudience === 'providers' || body.targetAudience === 'both') {
            const topicResult = await this.simplifiedChannelService.sendToProviders(payload.title, payload.body, payload.data, payload.imageUrl);
            results.topicResults.providers = {
                success: topicResult,
                method: 'topic-based',
                topic: 'channel_providers'
            };
        }
        if (body.targetAudience === 'users' || body.targetAudience === 'both') {
            const tokenResult = await this.simpleFCMService.sendToAllUsers(payload);
            results.tokenResults.users = {
                success: tokenResult.success,
                sentCount: tokenResult.sentCount,
                totalCount: tokenResult.totalCount,
                method: 'token-based'
            };
        }
        if (body.targetAudience === 'providers' || body.targetAudience === 'both') {
            const tokenResult = await this.simpleFCMService.sendToAllProviders(payload);
            results.tokenResults.providers = {
                success: tokenResult.success,
                sentCount: tokenResult.sentCount,
                totalCount: tokenResult.totalCount,
                method: 'token-based'
            };
        }
        return results;
    }
    async getSystemStatus() {
        const topics = this.fcmService.getAllTopics();
        const topicInfo = await Promise.all(topics.map(async (topic) => {
            const info = await this.fcmService.getTopicInfo(topic);
            return { topicName: topic, ...info };
        }));
        await this.fcmService.logTopicStats();
        return {
            message: '📊 FCM System Status',
            status: 'operational',
            firebaseInitialized: true,
            availableTopics: topicInfo,
            totalTopics: topics.length,
            timestamp: new Date().toISOString(),
            services: {
                fcmService: 'active',
                simpleFCMService: 'active',
                simplifiedChannelService: 'active'
            }
        };
    }
};
exports.NotificationTestController = NotificationTestController;
__decorate([
    (0, common_1.Post)('topics/test-all'),
    (0, swagger_1.ApiOperation)({ summary: 'Test all FCM topics with sample messages' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Test messages sent to all topics' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationTestController.prototype, "testAllTopics", null);
__decorate([
    (0, common_1.Post)('topics/test/:topic'),
    (0, swagger_1.ApiOperation)({ summary: 'Test specific FCM topic' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Test message sent to specific topic' }),
    __param(0, (0, common_1.Param)('topic')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], NotificationTestController.prototype, "testSpecificTopic", null);
__decorate([
    (0, common_1.Get)('topics/info'),
    (0, swagger_1.ApiOperation)({ summary: 'Get information about all available topics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Topic information retrieved' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationTestController.prototype, "getTopicsInfo", null);
__decorate([
    (0, common_1.Post)('tokens/test-user/:userId'),
    (0, swagger_1.ApiOperation)({ summary: 'Test FCM token notification to specific user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Test notification sent to user' }),
    __param(0, (0, common_1.Param)('userId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], NotificationTestController.prototype, "testUserToken", null);
__decorate([
    (0, common_1.Post)('tokens/test-provider/:providerId'),
    (0, swagger_1.ApiOperation)({ summary: 'Test FCM token notification to specific provider' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Test notification sent to provider' }),
    __param(0, (0, common_1.Param)('providerId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], NotificationTestController.prototype, "testProviderToken", null);
__decorate([
    (0, common_1.Post)('tokens/test-all-users'),
    (0, swagger_1.ApiOperation)({ summary: 'Test FCM token notifications to all users' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Test notifications sent to all users' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationTestController.prototype, "testAllUsersTokens", null);
__decorate([
    (0, common_1.Post)('tokens/test-all-providers'),
    (0, swagger_1.ApiOperation)({ summary: 'Test FCM token notifications to all providers' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Test notifications sent to all providers' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationTestController.prototype, "testAllProvidersTokens", null);
__decorate([
    (0, common_1.Post)('compare/topic-vs-token'),
    (0, swagger_1.ApiOperation)({ summary: 'Compare topic-based vs token-based messaging for the same audience' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Comparison test completed' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationTestController.prototype, "compareTopicVsToken", null);
__decorate([
    (0, common_1.Get)('status'),
    (0, swagger_1.ApiOperation)({ summary: 'Get FCM system status and statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'System status retrieved' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationTestController.prototype, "getSystemStatus", null);
exports.NotificationTestController = NotificationTestController = __decorate([
    (0, swagger_1.ApiTags)('notification-testing'),
    (0, common_1.Controller)('notification-test'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [fcm_service_1.FCMService,
        simple_fcm_service_1.SimpleFCMService,
        simplified_channel_service_1.SimplifiedChannelService])
], NotificationTestController);
//# sourceMappingURL=notification-test.controller.js.map
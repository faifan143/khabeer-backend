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
var ChannelService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChannelService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const fcm_service_1 = require("./fcm.service");
const channel_dto_1 = require("./dto/channel.dto");
let ChannelService = ChannelService_1 = class ChannelService {
    prisma;
    fcmService;
    logger = new common_1.Logger(ChannelService_1.name);
    constructor(prisma, fcmService) {
        this.prisma = prisma;
        this.fcmService = fcmService;
    }
    async subscribeUserToChannel(userId, channel) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                select: { fcmToken: true }
            });
            if (!user || !user.fcmToken) {
                this.logger.warn(`User ${userId} has no FCM token`);
                return false;
            }
            const topic = this.getChannelTopic(channel);
            const success = await this.fcmService.subscribeToTopic([user.fcmToken], topic);
            if (success) {
                this.logger.log(`User ${userId} subscribed to channel ${channel}`);
            }
            else {
                this.logger.error(`Failed to subscribe user ${userId} to channel ${channel}`);
            }
            return success;
        }
        catch (error) {
            this.logger.error(`Error subscribing user ${userId} to channel ${channel}:`, error);
            return false;
        }
    }
    async subscribeProviderToChannel(providerId, channel) {
        try {
            const provider = await this.prisma.provider.findUnique({
                where: { id: providerId },
                select: { fcmToken: true }
            });
            if (!provider || !provider.fcmToken) {
                this.logger.warn(`Provider ${providerId} has no FCM token`);
                return false;
            }
            const topic = this.getChannelTopic(channel);
            const success = await this.fcmService.subscribeToTopic([provider.fcmToken], topic);
            if (success) {
                this.logger.log(`Provider ${providerId} subscribed to channel ${channel}`);
            }
            else {
                this.logger.error(`Failed to subscribe provider ${providerId} to channel ${channel}`);
            }
            return success;
        }
        catch (error) {
            this.logger.error(`Error subscribing provider ${providerId} to channel ${channel}:`, error);
            return false;
        }
    }
    async unsubscribeUserFromChannel(userId, channel) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                select: { fcmToken: true }
            });
            if (!user || !user.fcmToken) {
                this.logger.warn(`User ${userId} has no FCM token`);
                return false;
            }
            const topic = this.getChannelTopic(channel);
            const success = await this.fcmService.unsubscribeFromTopic([user.fcmToken], topic);
            if (success) {
                this.logger.log(`User ${userId} unsubscribed from channel ${channel}`);
            }
            else {
                this.logger.error(`Failed to unsubscribe user ${userId} from channel ${channel}`);
            }
            return success;
        }
        catch (error) {
            this.logger.error(`Error unsubscribing user ${userId} from channel ${channel}:`, error);
            return false;
        }
    }
    async unsubscribeProviderFromChannel(providerId, channel) {
        try {
            const provider = await this.prisma.provider.findUnique({
                where: { id: providerId },
                select: { fcmToken: true }
            });
            if (!provider || !provider.fcmToken) {
                this.logger.warn(`Provider ${providerId} has no FCM token`);
                return false;
            }
            const topic = this.getChannelTopic(channel);
            const success = await this.fcmService.unsubscribeFromTopic([provider.fcmToken], topic);
            if (success) {
                this.logger.log(`Provider ${providerId} unsubscribed from channel ${channel}`);
            }
            else {
                this.logger.error(`Failed to unsubscribe provider ${providerId} from channel ${channel}`);
            }
            return success;
        }
        catch (error) {
            this.logger.error(`Error unsubscribing provider ${providerId} from channel ${channel}:`, error);
            return false;
        }
    }
    async bulkSubscriptionAction(fcmTokens, channel, action) {
        try {
            if (fcmTokens.length === 0) {
                this.logger.warn('No FCM tokens provided for bulk subscription action');
                return false;
            }
            const topic = this.getChannelTopic(channel);
            let success;
            if (action === channel_dto_1.SubscriptionAction.SUBSCRIBE) {
                success = await this.fcmService.subscribeToTopic(fcmTokens, topic);
                this.logger.log(`Bulk subscribed ${fcmTokens.length} tokens to channel ${channel}`);
            }
            else {
                success = await this.fcmService.unsubscribeFromTopic(fcmTokens, topic);
                this.logger.log(`Bulk unsubscribed ${fcmTokens.length} tokens from channel ${channel}`);
            }
            return success;
        }
        catch (error) {
            this.logger.error(`Error in bulk subscription action for channel ${channel}:`, error);
            return false;
        }
    }
    async subscribeAllUsersToChannel(channel) {
        try {
            const users = await this.prisma.user.findMany({
                where: { fcmToken: { not: null } },
                select: { fcmToken: true }
            });
            const tokens = users.map(user => user.fcmToken).filter(Boolean);
            if (tokens.length === 0) {
                this.logger.warn('No users with FCM tokens found');
                return { success: false, count: 0 };
            }
            const topic = this.getChannelTopic(channel);
            const success = await this.fcmService.subscribeToTopic(tokens, topic);
            this.logger.log(`Subscribed ${tokens.length} users to channel ${channel}`);
            return { success, count: tokens.length };
        }
        catch (error) {
            this.logger.error(`Error subscribing all users to channel ${channel}:`, error);
            return { success: false, count: 0 };
        }
    }
    async subscribeAllProvidersToChannel(channel) {
        try {
            const providers = await this.prisma.provider.findMany({
                where: { fcmToken: { not: null } },
                select: { fcmToken: true }
            });
            const tokens = providers.map(provider => provider.fcmToken).filter(Boolean);
            if (tokens.length === 0) {
                this.logger.warn('No providers with FCM tokens found');
                return { success: false, count: 0 };
            }
            const topic = this.getChannelTopic(channel);
            const success = await this.fcmService.subscribeToTopic(tokens, topic);
            this.logger.log(`Subscribed ${tokens.length} providers to channel ${channel}`);
            return { success, count: tokens.length };
        }
        catch (error) {
            this.logger.error(`Error subscribing all providers to channel ${channel}:`, error);
            return { success: false, count: 0 };
        }
    }
    async sendNotificationToChannel(channel, title, message, imageUrl, data) {
        try {
            const topic = this.getChannelTopic(channel);
            const payload = {
                title,
                body: message,
                imageUrl,
                data: {
                    channel,
                    ...data,
                },
            };
            const result = await this.fcmService.sendToTopic(topic, payload);
            if (result.success) {
                this.logger.log(`Notification sent to channel ${channel} successfully`);
            }
            else {
                this.logger.error(`Failed to send notification to channel ${channel}: ${result.error}`);
            }
            return result.success;
        }
        catch (error) {
            this.logger.error(`Error sending notification to channel ${channel}:`, error);
            return false;
        }
    }
    getChannelTopic(channel) {
        return `channel_${channel}`;
    }
    async getChannelStatistics() {
        try {
            const [users, providers] = await Promise.all([
                this.prisma.user.count({ where: { fcmToken: { not: null } } }),
                this.prisma.provider.count({ where: { fcmToken: { not: null } } })
            ]);
            return {
                [channel_dto_1.ChannelType.USERS]: { users, providers: 0 },
                [channel_dto_1.ChannelType.PROVIDERS]: { users: 0, providers },
                [channel_dto_1.ChannelType.ALL]: { users, providers },
            };
        }
        catch (error) {
            this.logger.error('Error getting channel statistics:', error);
            return {
                [channel_dto_1.ChannelType.USERS]: { users: 0, providers: 0 },
                [channel_dto_1.ChannelType.PROVIDERS]: { users: 0, providers: 0 },
                [channel_dto_1.ChannelType.ALL]: { users: 0, providers: 0 },
            };
        }
    }
};
exports.ChannelService = ChannelService;
exports.ChannelService = ChannelService = ChannelService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        fcm_service_1.FCMService])
], ChannelService);
//# sourceMappingURL=channel.service.js.map
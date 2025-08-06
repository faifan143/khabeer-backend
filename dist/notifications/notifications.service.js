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
var NotificationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const fcm_service_1 = require("./fcm.service");
const create_notification_dto_1 = require("./dto/create-notification.dto");
const channel_service_1 = require("./channel.service");
const channel_dto_1 = require("./dto/channel.dto");
let NotificationsService = NotificationsService_1 = class NotificationsService {
    prisma;
    fcmService;
    channelService;
    logger = new common_1.Logger(NotificationsService_1.name);
    constructor(prisma, fcmService, channelService) {
        this.prisma = prisma;
        this.fcmService = fcmService;
        this.channelService = channelService;
    }
    async createNotification(createNotificationDto) {
        try {
            const notification = await this.prisma.notification.create({
                data: {
                    title: createNotificationDto.title,
                    message: createNotificationDto.message,
                    imageUrl: createNotificationDto.imageUrl,
                    targetAudience: createNotificationDto.targetAudience,
                    notificationType: createNotificationDto.notificationType || create_notification_dto_1.NotificationType.GENERAL,
                    data: createNotificationDto.data || {},
                },
            });
            this.logger.log(`Notification created with ID: ${notification.id}`);
            return notification;
        }
        catch (error) {
            this.logger.error('Failed to create notification:', error);
            throw error;
        }
    }
    async sendNotification(notificationId) {
        try {
            const notification = await this.prisma.notification.findUnique({
                where: { id: notificationId },
            });
            if (!notification) {
                throw new Error('Notification not found');
            }
            if (notification.status === 'sent') {
                throw new Error('Notification already sent');
            }
            const results = await this.sendNotificationToChannels(notification);
            await this.prisma.notification.update({
                where: { id: notificationId },
                data: {
                    status: results.success ? 'sent' : 'failed',
                    recipientsCount: results.recipientsCount,
                    successCount: results.successCount,
                    failureCount: results.failureCount,
                    sentAt: new Date(),
                },
            });
            this.logger.log(`Notification ${notificationId} sent. Success: ${results.successCount}, Failure: ${results.failureCount}`);
            return results;
        }
        catch (error) {
            this.logger.error(`Failed to send notification ${notificationId}:`, error);
            await this.prisma.notification.update({
                where: { id: notificationId },
                data: {
                    status: 'failed',
                    sentAt: new Date(),
                },
            });
            throw error;
        }
    }
    async sendNotificationToChannels(notification) {
        const targetAudience = notification.targetAudience;
        let totalSuccessCount = 0;
        let totalFailureCount = 0;
        let totalRecipientsCount = 0;
        const fcmPayload = {
            title: notification.title,
            body: notification.message,
            imageUrl: notification.imageUrl || undefined,
            data: {
                notificationId: notification.id.toString(),
                notificationType: notification.notificationType,
                ...notification.data,
            },
        };
        for (const audience of targetAudience) {
            try {
                const channelType = this.mapTargetAudienceToChannel(audience);
                const success = await this.channelService.sendNotificationToChannel(channelType, fcmPayload.title, fcmPayload.body, fcmPayload.imageUrl, fcmPayload.data);
                if (success) {
                    totalSuccessCount++;
                    const stats = await this.channelService.getChannelStatistics();
                    const channelStats = stats[channelType];
                    totalRecipientsCount += (channelStats?.users || 0) + (channelStats?.providers || 0);
                }
                else {
                    totalFailureCount++;
                }
            }
            catch (error) {
                this.logger.error(`Failed to send to channel ${audience}:`, error);
                totalFailureCount++;
            }
        }
        return {
            success: totalFailureCount === 0,
            recipientsCount: totalRecipientsCount,
            successCount: totalSuccessCount,
            failureCount: totalFailureCount,
        };
    }
    mapTargetAudienceToChannel(audience) {
        switch (audience) {
            case create_notification_dto_1.TargetAudience.CUSTOMERS:
                return channel_dto_1.ChannelType.USERS;
            case create_notification_dto_1.TargetAudience.PROVIDERS:
                return channel_dto_1.ChannelType.PROVIDERS;
            case create_notification_dto_1.TargetAudience.ALL:
                return channel_dto_1.ChannelType.ALL;
            default:
                return channel_dto_1.ChannelType.ALL;
        }
    }
    async getTargetAudienceTokens(targetAudience) {
        const tokens = [];
        for (const audience of targetAudience) {
            switch (audience) {
                case create_notification_dto_1.TargetAudience.CUSTOMERS:
                    const userTokens = await this.prisma.user.findMany({
                        where: {
                            isActive: true,
                            fcmToken: { not: null },
                        },
                        select: { fcmToken: true },
                    });
                    tokens.push(...userTokens.map(u => u.fcmToken).filter((token) => Boolean(token)));
                    break;
                case create_notification_dto_1.TargetAudience.PROVIDERS:
                    const providerTokens = await this.prisma.provider.findMany({
                        where: {
                            isActive: true,
                            fcmToken: { not: null },
                        },
                        select: { fcmToken: true },
                    });
                    tokens.push(...providerTokens.map(p => p.fcmToken).filter((token) => Boolean(token)));
                    break;
                case create_notification_dto_1.TargetAudience.ALL:
                    const allUserTokens = await this.prisma.user.findMany({
                        where: {
                            isActive: true,
                            fcmToken: { not: null },
                        },
                        select: { fcmToken: true },
                    });
                    const allProviderTokens = await this.prisma.provider.findMany({
                        where: {
                            isActive: true,
                            fcmToken: { not: null },
                        },
                        select: { fcmToken: true },
                    });
                    tokens.push(...allUserTokens.map(u => u.fcmToken).filter((token) => Boolean(token)), ...allProviderTokens.map(p => p.fcmToken).filter((token) => Boolean(token)));
                    break;
            }
        }
        return [...new Set(tokens)];
    }
    async updateUserFcmToken(userId, fcmToken) {
        try {
            await this.prisma.user.update({
                where: { id: userId },
                data: { fcmToken },
            });
            await this.channelService.subscribeUserToChannel(userId, channel_dto_1.ChannelType.USERS);
            this.logger.log(`FCM token updated for user ${userId} and subscribed to users channel`);
            return { success: true };
        }
        catch (error) {
            this.logger.error(`Failed to update FCM token for user ${userId}:`, error);
            throw error;
        }
    }
    async updateProviderFcmToken(providerId, fcmToken) {
        try {
            await this.prisma.provider.update({
                where: { id: providerId },
                data: { fcmToken },
            });
            await this.channelService.subscribeProviderToChannel(providerId, channel_dto_1.ChannelType.PROVIDERS);
            this.logger.log(`FCM token updated for provider ${providerId} and subscribed to providers channel`);
            return { success: true };
        }
        catch (error) {
            this.logger.error(`Failed to update FCM token for provider ${providerId}:`, error);
            throw error;
        }
    }
    async sendOrderNotification(orderId, title, message, data) {
        try {
            const order = await this.prisma.order.findUnique({
                where: { id: orderId },
                include: {
                    user: true,
                    provider: true,
                },
            });
            if (!order) {
                throw new Error('Order not found');
            }
            const tokens = [];
            if (order.user.fcmToken) {
                tokens.push(order.user.fcmToken);
            }
            if (order.provider.fcmToken) {
                tokens.push(order.provider.fcmToken);
            }
            if (tokens.length === 0) {
                this.logger.warn(`No FCM tokens found for order ${orderId}`);
                return { success: true, message: 'No recipients found' };
            }
            const fcmPayload = {
                title,
                body: message,
                data: {
                    orderId: orderId.toString(),
                    notificationType: create_notification_dto_1.NotificationType.ORDER,
                    ...data,
                },
            };
            const results = await this.fcmService.sendToMultipleTokens(tokens, fcmPayload);
            this.logger.log(`Order notification sent for order ${orderId}. Success: ${results.filter(r => r.success).length}`);
            return {
                success: true,
                recipientsCount: tokens.length,
                results,
            };
        }
        catch (error) {
            this.logger.error(`Failed to send order notification for order ${orderId}:`, error);
            throw error;
        }
    }
    async sendOfferNotification(offerId, title, message, data) {
        try {
            const offer = await this.prisma.offer.findUnique({
                where: { id: offerId },
                include: {
                    provider: true,
                },
            });
            if (!offer) {
                throw new Error('Offer not found');
            }
            const users = await this.prisma.user.findMany({
                where: {
                    isActive: true,
                    fcmToken: { not: null },
                },
                select: { fcmToken: true },
            });
            const tokens = users.map(u => u.fcmToken).filter((token) => Boolean(token));
            if (tokens.length === 0) {
                this.logger.warn(`No FCM tokens found for offer ${offerId}`);
                return { success: true, message: 'No recipients found' };
            }
            const fcmPayload = {
                title,
                body: message,
                data: {
                    offerId: offerId.toString(),
                    notificationType: create_notification_dto_1.NotificationType.OFFER,
                    ...data,
                },
            };
            const results = await this.fcmService.sendToMultipleTokens(tokens, fcmPayload);
            this.logger.log(`Offer notification sent for offer ${offerId}. Success: ${results.filter(r => r.success).length}`);
            return {
                success: true,
                recipientsCount: tokens.length,
                results,
            };
        }
        catch (error) {
            this.logger.error(`Failed to send offer notification for offer ${offerId}:`, error);
            throw error;
        }
    }
    async getAllNotifications(page = 1, limit = 10) {
        try {
            const skip = (page - 1) * limit;
            const [notifications, total] = await Promise.all([
                this.prisma.notification.findMany({
                    skip,
                    take: limit,
                    orderBy: { createdAt: 'desc' },
                }),
                this.prisma.notification.count(),
            ]);
            return {
                notifications,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit),
                },
            };
        }
        catch (error) {
            this.logger.error('Failed to get notifications:', error);
            throw error;
        }
    }
    async getNotificationById(id) {
        try {
            const notification = await this.prisma.notification.findUnique({
                where: { id },
            });
            if (!notification) {
                throw new Error('Notification not found');
            }
            return notification;
        }
        catch (error) {
            this.logger.error(`Failed to get notification ${id}:`, error);
            throw error;
        }
    }
    async deleteNotification(id) {
        try {
            const notification = await this.prisma.notification.findUnique({
                where: { id },
            });
            if (!notification) {
                throw new Error('Notification not found');
            }
            if (notification.status === 'sent') {
                throw new Error('Cannot delete sent notification');
            }
            await this.prisma.notification.delete({
                where: { id },
            });
            this.logger.log(`Notification ${id} deleted successfully`);
            return { success: true };
        }
        catch (error) {
            this.logger.error(`Failed to delete notification ${id}:`, error);
            throw error;
        }
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = NotificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        fcm_service_1.FCMService,
        channel_service_1.ChannelService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map
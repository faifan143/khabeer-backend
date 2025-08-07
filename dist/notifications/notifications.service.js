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
const create_notification_dto_1 = require("./dto/create-notification.dto");
const simplified_channel_service_1 = require("./simplified-channel.service");
let NotificationsService = NotificationsService_1 = class NotificationsService {
    prisma;
    simplifiedChannelService;
    logger = new common_1.Logger(NotificationsService_1.name);
    constructor(prisma, simplifiedChannelService) {
        this.prisma = prisma;
        this.simplifiedChannelService = simplifiedChannelService;
    }
    async createNotification(createNotificationDto) {
        try {
            const notification = await this.prisma.notification.create({
                data: {
                    title: createNotificationDto.title,
                    message: createNotificationDto.message || '',
                    imageUrl: createNotificationDto.imageUrl,
                    targetAudience: createNotificationDto.targetAudience,
                    notificationType: createNotificationDto.notificationType || create_notification_dto_1.NotificationType.GENERAL,
                    data: createNotificationDto.data || {},
                    status: 'draft',
                },
            });
            this.logger.log(`Notification created with ID: ${notification.id}`);
            try {
                let targetAudienceArray;
                if (typeof notification.targetAudience === 'string') {
                    try {
                        targetAudienceArray = JSON.parse(notification.targetAudience);
                    }
                    catch (parseError) {
                        this.logger.error(`Failed to parse targetAudience JSON: ${notification.targetAudience}`, parseError);
                        targetAudienceArray = [];
                    }
                }
                else {
                    targetAudienceArray = notification.targetAudience;
                }
                const topics = this.mapTargetAudienceToTopics(targetAudienceArray);
                const result = await this.simplifiedChannelService.sendNotificationToTopics(topics, notification.title, notification.message, notification.data, notification.imageUrl || undefined);
                await this.prisma.notification.update({
                    where: { id: notification.id },
                    data: {
                        status: result.success ? 'sent' : 'failed',
                        sentAt: new Date(),
                        recipientsCount: result.success ? 1000 : 0,
                    },
                });
                this.logger.log(`Notification ${notification.id} sent to topics: ${topics.join(', ')}`);
                return {
                    ...notification,
                    status: result.success ? 'sent' : 'failed',
                    sentAt: new Date(),
                };
            }
            catch (sendError) {
                this.logger.error(`Failed to send notification ${notification.id}:`, sendError);
                await this.prisma.notification.update({
                    where: { id: notification.id },
                    data: {
                        status: 'failed',
                        sentAt: new Date(),
                    },
                });
                return {
                    ...notification,
                    status: 'failed',
                    sentAt: new Date(),
                };
            }
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
            let targetAudienceArray;
            if (typeof notification.targetAudience === 'string') {
                try {
                    targetAudienceArray = JSON.parse(notification.targetAudience);
                }
                catch (parseError) {
                    this.logger.error(`Failed to parse targetAudience JSON: ${notification.targetAudience}`, parseError);
                    targetAudienceArray = [];
                }
            }
            else {
                targetAudienceArray = notification.targetAudience;
            }
            const topics = this.mapTargetAudienceToTopics(targetAudienceArray);
            const result = await this.simplifiedChannelService.sendNotificationToTopics(topics, notification.title, notification.message, notification.data, notification.imageUrl || undefined);
            await this.prisma.notification.update({
                where: { id: notificationId },
                data: {
                    status: result.success ? 'sent' : 'failed',
                    sentAt: new Date(),
                },
            });
            this.logger.log(`Notification ${notificationId} sent to topics: ${topics.join(', ')}`);
            return result;
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
    mapTargetAudienceToTopics(targetAudience) {
        const topics = [];
        for (const audience of targetAudience) {
            switch (audience) {
                case create_notification_dto_1.TargetAudience.CUSTOMERS:
                    topics.push('channel_users');
                    break;
                case create_notification_dto_1.TargetAudience.PROVIDERS:
                    topics.push('channel_providers');
                    break;
                default:
                    this.logger.warn(`Unknown audience type: ${audience}`);
            }
        }
        return [...new Set(topics)];
    }
    async sendOrderNotification(orderId, title, message, data, imageUrl) {
        try {
            const order = await this.prisma.order.findUnique({
                where: { id: orderId },
            });
            if (!order) {
                throw new Error('Order not found');
            }
            const topics = ['channel_users', 'channel_providers'];
            const result = await this.simplifiedChannelService.sendNotificationToTopics(topics, title, message, {
                orderId: orderId.toString(),
                notificationType: create_notification_dto_1.NotificationType.ORDER,
                ...data,
            }, imageUrl);
            this.logger.log(`Order notification sent for order ${orderId} to topics: ${topics.join(', ')}`);
            return {
                success: result.success,
                message: 'Order notification sent via topics',
            };
        }
        catch (error) {
            this.logger.error(`Failed to send order notification for order ${orderId}:`, error);
            throw error;
        }
    }
    async sendOfferNotification(offerId, title, message, data, imageUrl) {
        try {
            const offer = await this.prisma.offer.findUnique({
                where: { id: offerId },
            });
            if (!offer) {
                throw new Error('Offer not found');
            }
            const result = await this.simplifiedChannelService.sendToUsers(title, message, {
                offerId: offerId.toString(),
                notificationType: create_notification_dto_1.NotificationType.OFFER,
                ...data,
            }, imageUrl);
            this.logger.log(`Offer notification sent for offer ${offerId} to users channel`);
            return {
                success: result,
                message: 'Offer notification sent via topics',
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
    async getTopicInfo() {
        try {
            const recentNotifications = await this.prisma.notification.findMany({
                where: {
                    status: 'sent',
                    sentAt: {
                        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                    }
                },
                orderBy: { sentAt: 'desc' },
                take: 50
            });
            const topicStats = {
                channel_users: {
                    topic: 'channel_users',
                    description: 'Customer notifications',
                    lastMessageSent: null,
                    messageCount: 0,
                    recentMessages: []
                },
                channel_providers: {
                    topic: 'channel_providers',
                    description: 'Provider notifications',
                    lastMessageSent: null,
                    messageCount: 0,
                    recentMessages: []
                }
            };
            recentNotifications.forEach(notification => {
                const targetAudience = notification.targetAudience;
                if (targetAudience.includes('customers')) {
                    topicStats.channel_users.messageCount++;
                    if (!topicStats.channel_users.lastMessageSent) {
                        topicStats.channel_users.lastMessageSent = notification.sentAt?.toISOString() || null;
                    }
                    topicStats.channel_users.recentMessages.push({
                        id: notification.id,
                        title: notification.title,
                        sentAt: notification.sentAt,
                        recipientsCount: notification.recipientsCount
                    });
                }
                if (targetAudience.includes('providers')) {
                    topicStats.channel_providers.messageCount++;
                    if (!topicStats.channel_providers.lastMessageSent) {
                        topicStats.channel_providers.lastMessageSent = notification.sentAt?.toISOString() || null;
                    }
                    topicStats.channel_providers.recentMessages.push({
                        id: notification.id,
                        title: notification.title,
                        sentAt: notification.sentAt,
                        recipientsCount: notification.recipientsCount
                    });
                }
            });
            topicStats.channel_users.recentMessages = topicStats.channel_users.recentMessages.slice(0, 10);
            topicStats.channel_providers.recentMessages = topicStats.channel_providers.recentMessages.slice(0, 10);
            return {
                topics: Object.values(topicStats),
                totalTopics: 2,
                lastUpdated: new Date().toISOString()
            };
        }
        catch (error) {
            this.logger.error('Failed to get topic info:', error);
            throw error;
        }
    }
    async sendNotificationToTopics(topics, title, message, data, imageUrl) {
        try {
            const result = await this.simplifiedChannelService.sendNotificationToTopics(topics, title, message, data, imageUrl);
            this.logger.log(`Test messages sent to topics: ${topics.join(', ')}`);
            return result;
        }
        catch (error) {
            this.logger.error(`Failed to send test messages to topics ${topics.join(', ')}:`, error);
            throw error;
        }
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = NotificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        simplified_channel_service_1.SimplifiedChannelService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map
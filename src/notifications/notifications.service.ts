import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto, NotificationType, TargetAudience } from './dto/create-notification.dto';
import { SimplifiedChannelService } from './simplified-channel.service';

@Injectable()
export class NotificationsService {
    private readonly logger = new Logger(NotificationsService.name);

    constructor(
        private prisma: PrismaService,
        private simplifiedChannelService: SimplifiedChannelService,
    ) { }

    async createNotification(createNotificationDto: CreateNotificationDto) {
        try {
            // Create notification in database
            const notification = await this.prisma.notification.create({
                data: {
                    title: createNotificationDto.title,
                    message: createNotificationDto.message || '',
                    imageUrl: createNotificationDto.imageUrl,
                    targetAudience: createNotificationDto.targetAudience,
                    notificationType: createNotificationDto.notificationType || NotificationType.GENERAL,
                    data: createNotificationDto.data || {},
                    status: 'draft', // Start as draft
                },
            });

            this.logger.log(`Notification created with ID: ${notification.id}`);

            // Immediately send the notification to topics
            try {
                // Parse targetAudience if it's a JSON string
                let targetAudienceArray: TargetAudience[];
                if (typeof notification.targetAudience === 'string') {
                    try {
                        targetAudienceArray = JSON.parse(notification.targetAudience);
                    } catch (parseError) {
                        this.logger.error(`Failed to parse targetAudience JSON: ${notification.targetAudience}`, parseError);
                        targetAudienceArray = [];
                    }
                } else {
                    targetAudienceArray = notification.targetAudience as TargetAudience[];
                }

                const topics = this.mapTargetAudienceToTopics(targetAudienceArray);

                const result = await this.simplifiedChannelService.sendNotificationToTopics(
                    topics,
                    notification.title,
                    notification.message,
                    notification.data as Record<string, string>,
                    notification.imageUrl || undefined
                );

                // Update notification status based on sending result
                await this.prisma.notification.update({
                    where: { id: notification.id },
                    data: {
                        status: result.success ? 'sent' : 'failed',
                        sentAt: new Date(),
                        recipientsCount: result.success ? 1000 : 0, // Mock count - replace with actual logic
                    },
                });

                this.logger.log(`Notification ${notification.id} sent to topics: ${topics.join(', ')}`);

                return {
                    ...notification,
                    status: result.success ? 'sent' : 'failed',
                    sentAt: new Date(),
                };
            } catch (sendError) {
                // If sending fails, keep notification as draft for retry
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
        } catch (error) {
            this.logger.error('Failed to create notification:', error);
            throw error;
        }
    }

    async sendNotification(notificationId: number) {
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

            // Parse targetAudience if it's a JSON string
            let targetAudienceArray: TargetAudience[];
            if (typeof notification.targetAudience === 'string') {
                try {
                    targetAudienceArray = JSON.parse(notification.targetAudience);
                } catch (parseError) {
                    this.logger.error(`Failed to parse targetAudience JSON: ${notification.targetAudience}`, parseError);
                    targetAudienceArray = [];
                }
            } else {
                targetAudienceArray = notification.targetAudience as TargetAudience[];
            }

            // Map target audience to topics
            const topics = this.mapTargetAudienceToTopics(targetAudienceArray);

            // Send to topics
            const result = await this.simplifiedChannelService.sendNotificationToTopics(
                topics,
                notification.title,
                notification.message,
                notification.data as Record<string, string>,
                notification.imageUrl || undefined
            );

            // Update notification status
            await this.prisma.notification.update({
                where: { id: notificationId },
                data: {
                    status: result.success ? 'sent' : 'failed',
                    sentAt: new Date(),
                },
            });

            this.logger.log(`Notification ${notificationId} sent to topics: ${topics.join(', ')}`);

            return result;
        } catch (error) {
            this.logger.error(`Failed to send notification ${notificationId}:`, error);

            // Update notification status to failed
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

    /**
     * Map target audience to FCM topics
     */
    private mapTargetAudienceToTopics(targetAudience: TargetAudience[]): string[] {
        const topics: string[] = [];

        for (const audience of targetAudience) {
            switch (audience) {
                case TargetAudience.CUSTOMERS:
                    topics.push('channel_users');
                    break;
                case TargetAudience.PROVIDERS:
                    topics.push('channel_providers');
                    break;
                default:
                    this.logger.warn(`Unknown audience type: ${audience}`);
            }
        }

        return [...new Set(topics)]; // Remove duplicates
    }

    // getTargetAudienceTokens method removed - using topics only

    // FCM token methods removed - using topics only

    async sendOrderNotification(orderId: number, title: string, message: string, data?: Record<string, any>, imageUrl?: string) {
        try {
            const order = await this.prisma.order.findUnique({
                where: { id: orderId },
            });

            if (!order) {
                throw new Error('Order not found');
            }

            // Send to both users and providers channels for order notifications
            const topics = ['channel_users', 'channel_providers'];

            const result = await this.simplifiedChannelService.sendNotificationToTopics(
                topics,
                title,
                message,
                {
                    orderId: orderId.toString(),
                    notificationType: NotificationType.ORDER,
                    ...data,
                },
                imageUrl
            );

            this.logger.log(`Order notification sent for order ${orderId} to topics: ${topics.join(', ')}`);

            return {
                success: result.success,
                message: 'Order notification sent via topics',
            };
        } catch (error) {
            this.logger.error(`Failed to send order notification for order ${orderId}:`, error);
            throw error;
        }
    }

    async sendOfferNotification(offerId: number, title: string, message: string, data?: Record<string, any>, imageUrl?: string) {
        try {
            const offer = await this.prisma.offer.findUnique({
                where: { id: offerId },
            });

            if (!offer) {
                throw new Error('Offer not found');
            }

            // Send to users channel for offer notifications
            const result = await this.simplifiedChannelService.sendToUsers(
                title,
                message,
                {
                    offerId: offerId.toString(),
                    notificationType: NotificationType.OFFER,
                    ...data,
                },
                imageUrl
            );

            this.logger.log(`Offer notification sent for offer ${offerId} to users channel`);

            return {
                success: result,
                message: 'Offer notification sent via topics',
            };
        } catch (error) {
            this.logger.error(`Failed to send offer notification for offer ${offerId}:`, error);
            throw error;
        }
    }

    async getAllNotifications(page: number = 1, limit: number = 10) {
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
        } catch (error) {
            this.logger.error('Failed to get notifications:', error);
            throw error;
        }
    }

    async getNotificationById(id: number) {
        try {
            const notification = await this.prisma.notification.findUnique({
                where: { id },
            });

            if (!notification) {
                throw new Error('Notification not found');
            }

            return notification;
        } catch (error) {
            this.logger.error(`Failed to get notification ${id}:`, error);
            throw error;
        }
    }

    async deleteNotification(id: number) {
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
        } catch (error) {
            this.logger.error(`Failed to delete notification ${id}:`, error);
            throw error;
        }
    }

    async getTopicInfo() {
        try {
            // Get recent notifications for each topic
            const recentNotifications = await this.prisma.notification.findMany({
                where: {
                    status: 'sent',
                    sentAt: {
                        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
                    }
                },
                orderBy: { sentAt: 'desc' },
                take: 50
            });

            // Group notifications by target audience
            const topicStats = {
                channel_users: {
                    topic: 'channel_users',
                    description: 'Customer notifications',
                    lastMessageSent: null as string | null,
                    messageCount: 0,
                    recentMessages: [] as any[]
                },
                channel_providers: {
                    topic: 'channel_providers',
                    description: 'Provider notifications',
                    lastMessageSent: null as string | null,
                    messageCount: 0,
                    recentMessages: [] as any[]
                }
            };

            // Process notifications
            recentNotifications.forEach(notification => {
                const targetAudience = notification.targetAudience as string[];

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

            // Limit recent messages to 10 per topic
            topicStats.channel_users.recentMessages = topicStats.channel_users.recentMessages.slice(0, 10);
            topicStats.channel_providers.recentMessages = topicStats.channel_providers.recentMessages.slice(0, 10);

            return {
                topics: Object.values(topicStats),
                totalTopics: 2,
                lastUpdated: new Date().toISOString()
            };
        } catch (error) {
            this.logger.error('Failed to get topic info:', error);
            throw error;
        }
    }

    async sendNotificationToTopics(topics: string[], title: string, message: string, data?: Record<string, string>, imageUrl?: string) {
        try {
            const result = await this.simplifiedChannelService.sendNotificationToTopics(
                topics,
                title,
                message,
                data,
                imageUrl
            );

            this.logger.log(`Test messages sent to topics: ${topics.join(', ')}`);
            return result;
        } catch (error) {
            this.logger.error(`Failed to send test messages to topics ${topics.join(', ')}:`, error);
            throw error;
        }
    }
} 
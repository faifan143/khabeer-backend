import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FCMService, FCMNotificationPayload } from './fcm.service';
import { CreateNotificationDto, NotificationType, TargetAudience } from './dto/create-notification.dto';
import { ChannelService } from './channel.service';
import { ChannelType } from './dto/channel.dto';

@Injectable()
export class NotificationsService {
    private readonly logger = new Logger(NotificationsService.name);

    constructor(
        private prisma: PrismaService,
        private fcmService: FCMService,
        private channelService: ChannelService,
    ) { }

    async createNotification(createNotificationDto: CreateNotificationDto) {
        try {
            const notification = await this.prisma.notification.create({
                data: {
                    title: createNotificationDto.title,
                    message: createNotificationDto.message,
                    imageUrl: createNotificationDto.imageUrl,
                    targetAudience: createNotificationDto.targetAudience,
                    notificationType: createNotificationDto.notificationType || NotificationType.GENERAL,
                    data: createNotificationDto.data || {},
                },
            });

            this.logger.log(`Notification created with ID: ${notification.id}`);
            return notification;
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

            // Use channel-based sending for better performance and scalability
            const results = await this.sendNotificationToChannels(notification);

            // Update notification status
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
     * Send notification using channel-based approach
     */
    private async sendNotificationToChannels(notification: any) {
        const targetAudience = notification.targetAudience as TargetAudience[];
        let totalSuccessCount = 0;
        let totalFailureCount = 0;
        let totalRecipientsCount = 0;

        // Prepare FCM payload
        const fcmPayload: FCMNotificationPayload = {
            title: notification.title,
            body: notification.message,
            imageUrl: notification.imageUrl || undefined,
            data: {
                notificationId: notification.id.toString(),
                notificationType: notification.notificationType,
                ...(notification.data as Record<string, string>),
            },
        };

        // Send to each target audience channel
        for (const audience of targetAudience) {
            try {
                const channelType = this.mapTargetAudienceToChannel(audience);
                const success = await this.channelService.sendNotificationToChannel(
                    channelType,
                    fcmPayload.title,
                    fcmPayload.body,
                    fcmPayload.imageUrl,
                    fcmPayload.data
                );

                if (success) {
                    totalSuccessCount++;
                    // Get approximate recipient count for this channel
                    const stats = await this.channelService.getChannelStatistics();
                    const channelStats = stats[channelType];
                    totalRecipientsCount += (channelStats?.users || 0) + (channelStats?.providers || 0);
                } else {
                    totalFailureCount++;
                }
            } catch (error) {
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

    /**
     * Map target audience to channel type
     */
    private mapTargetAudienceToChannel(audience: TargetAudience): ChannelType {
        switch (audience) {
            case TargetAudience.CUSTOMERS:
                return ChannelType.USERS;
            case TargetAudience.PROVIDERS:
                return ChannelType.PROVIDERS;
            case TargetAudience.ALL:
                return ChannelType.ALL;
            default:
                return ChannelType.ALL;
        }
    }

    private async getTargetAudienceTokens(targetAudience: TargetAudience[]): Promise<string[]> {
        const tokens: string[] = [];

        for (const audience of targetAudience) {
            switch (audience) {
                case TargetAudience.CUSTOMERS:
                    const userTokens = await this.prisma.user.findMany({
                        where: {
                            isActive: true,
                            fcmToken: { not: null },
                        },
                        select: { fcmToken: true },
                    });
                    tokens.push(...userTokens.map(u => u.fcmToken).filter((token): token is string => Boolean(token)));
                    break;

                case TargetAudience.PROVIDERS:
                    const providerTokens = await this.prisma.provider.findMany({
                        where: {
                            isActive: true,
                            fcmToken: { not: null },
                        },
                        select: { fcmToken: true },
                    });
                    tokens.push(...providerTokens.map(p => p.fcmToken).filter((token): token is string => Boolean(token)));
                    break;

                case TargetAudience.ALL:
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
                    tokens.push(
                        ...allUserTokens.map(u => u.fcmToken).filter((token): token is string => Boolean(token)),
                        ...allProviderTokens.map(p => p.fcmToken).filter((token): token is string => Boolean(token))
                    );
                    break;
            }
        }

        return [...new Set(tokens)]; // Remove duplicates
    }

    async updateUserFcmToken(userId: number, fcmToken: string) {
        try {
            await this.prisma.user.update({
                where: { id: userId },
                data: { fcmToken },
            });

            // Automatically subscribe user to the users channel
            await this.channelService.subscribeUserToChannel(userId, ChannelType.USERS);

            this.logger.log(`FCM token updated for user ${userId} and subscribed to users channel`);
            return { success: true };
        } catch (error) {
            this.logger.error(`Failed to update FCM token for user ${userId}:`, error);
            throw error;
        }
    }

    async updateProviderFcmToken(providerId: number, fcmToken: string) {
        try {
            await this.prisma.provider.update({
                where: { id: providerId },
                data: { fcmToken },
            });

            // Automatically subscribe provider to the providers channel
            await this.channelService.subscribeProviderToChannel(providerId, ChannelType.PROVIDERS);

            this.logger.log(`FCM token updated for provider ${providerId} and subscribed to providers channel`);
            return { success: true };
        } catch (error) {
            this.logger.error(`Failed to update FCM token for provider ${providerId}:`, error);
            throw error;
        }
    }

    async sendOrderNotification(orderId: number, title: string, message: string, data?: Record<string, any>) {
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

            const tokens: string[] = [];

            // Add user token
            if (order.user.fcmToken) {
                tokens.push(order.user.fcmToken);
            }

            // Add provider token
            if (order.provider.fcmToken) {
                tokens.push(order.provider.fcmToken);
            }

            if (tokens.length === 0) {
                this.logger.warn(`No FCM tokens found for order ${orderId}`);
                return { success: true, message: 'No recipients found' };
            }

            const fcmPayload: FCMNotificationPayload = {
                title,
                body: message,
                data: {
                    orderId: orderId.toString(),
                    notificationType: NotificationType.ORDER,
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
        } catch (error) {
            this.logger.error(`Failed to send order notification for order ${orderId}:`, error);
            throw error;
        }
    }

    async sendOfferNotification(offerId: number, title: string, message: string, data?: Record<string, any>) {
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

            // Get all active users for offer notifications
            const users = await this.prisma.user.findMany({
                where: {
                    isActive: true,
                    fcmToken: { not: null },
                },
                select: { fcmToken: true },
            });

            const tokens = users.map(u => u.fcmToken).filter((token): token is string => Boolean(token));

            if (tokens.length === 0) {
                this.logger.warn(`No FCM tokens found for offer ${offerId}`);
                return { success: true, message: 'No recipients found' };
            }

            const fcmPayload: FCMNotificationPayload = {
                title,
                body: message,
                data: {
                    offerId: offerId.toString(),
                    notificationType: NotificationType.OFFER,
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
} 
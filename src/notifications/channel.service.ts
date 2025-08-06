import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FCMService } from './fcm.service';
import { ChannelType, SubscriptionAction } from './dto/channel.dto';

@Injectable()
export class ChannelService {
    private readonly logger = new Logger(ChannelService.name);

    constructor(
        private prisma: PrismaService,
        private fcmService: FCMService,
    ) { }

    /**
     * Subscribe a user to a channel
     */
    async subscribeUserToChannel(userId: number, channel: ChannelType): Promise<boolean> {
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
            } else {
                this.logger.error(`Failed to subscribe user ${userId} to channel ${channel}`);
            }

            return success;
        } catch (error) {
            this.logger.error(`Error subscribing user ${userId} to channel ${channel}:`, error);
            return false;
        }
    }

    /**
     * Subscribe a provider to a channel
     */
    async subscribeProviderToChannel(providerId: number, channel: ChannelType): Promise<boolean> {
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
            } else {
                this.logger.error(`Failed to subscribe provider ${providerId} to channel ${channel}`);
            }

            return success;
        } catch (error) {
            this.logger.error(`Error subscribing provider ${providerId} to channel ${channel}:`, error);
            return false;
        }
    }

    /**
     * Unsubscribe a user from a channel
     */
    async unsubscribeUserFromChannel(userId: number, channel: ChannelType): Promise<boolean> {
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
            } else {
                this.logger.error(`Failed to unsubscribe user ${userId} from channel ${channel}`);
            }

            return success;
        } catch (error) {
            this.logger.error(`Error unsubscribing user ${userId} from channel ${channel}:`, error);
            return false;
        }
    }

    /**
     * Unsubscribe a provider from a channel
     */
    async unsubscribeProviderFromChannel(providerId: number, channel: ChannelType): Promise<boolean> {
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
            } else {
                this.logger.error(`Failed to unsubscribe provider ${providerId} from channel ${channel}`);
            }

            return success;
        } catch (error) {
            this.logger.error(`Error unsubscribing provider ${providerId} from channel ${channel}:`, error);
            return false;
        }
    }

    /**
     * Bulk subscribe/unsubscribe FCM tokens to/from a channel
     */
    async bulkSubscriptionAction(
        fcmTokens: string[],
        channel: ChannelType,
        action: SubscriptionAction
    ): Promise<boolean> {
        try {
            if (fcmTokens.length === 0) {
                this.logger.warn('No FCM tokens provided for bulk subscription action');
                return false;
            }

            const topic = this.getChannelTopic(channel);
            let success: boolean;

            if (action === SubscriptionAction.SUBSCRIBE) {
                success = await this.fcmService.subscribeToTopic(fcmTokens, topic);
                this.logger.log(`Bulk subscribed ${fcmTokens.length} tokens to channel ${channel}`);
            } else {
                success = await this.fcmService.unsubscribeFromTopic(fcmTokens, topic);
                this.logger.log(`Bulk unsubscribed ${fcmTokens.length} tokens from channel ${channel}`);
            }

            return success;
        } catch (error) {
            this.logger.error(`Error in bulk subscription action for channel ${channel}:`, error);
            return false;
        }
    }

    /**
     * Subscribe all users to a channel
     */
    async subscribeAllUsersToChannel(channel: ChannelType): Promise<{ success: boolean; count: number }> {
        try {
            const users = await this.prisma.user.findMany({
                where: { fcmToken: { not: null } },
                select: { fcmToken: true }
            });

            const tokens = users.map(user => user.fcmToken).filter(Boolean) as string[];

            if (tokens.length === 0) {
                this.logger.warn('No users with FCM tokens found');
                return { success: false, count: 0 };
            }

            const topic = this.getChannelTopic(channel);
            const success = await this.fcmService.subscribeToTopic(tokens, topic);

            this.logger.log(`Subscribed ${tokens.length} users to channel ${channel}`);
            return { success, count: tokens.length };
        } catch (error) {
            this.logger.error(`Error subscribing all users to channel ${channel}:`, error);
            return { success: false, count: 0 };
        }
    }

    /**
     * Subscribe all providers to a channel
     */
    async subscribeAllProvidersToChannel(channel: ChannelType): Promise<{ success: boolean; count: number }> {
        try {
            const providers = await this.prisma.provider.findMany({
                where: { fcmToken: { not: null } },
                select: { fcmToken: true }
            });

            const tokens = providers.map(provider => provider.fcmToken).filter(Boolean) as string[];

            if (tokens.length === 0) {
                this.logger.warn('No providers with FCM tokens found');
                return { success: false, count: 0 };
            }

            const topic = this.getChannelTopic(channel);
            const success = await this.fcmService.subscribeToTopic(tokens, topic);

            this.logger.log(`Subscribed ${tokens.length} providers to channel ${channel}`);
            return { success, count: tokens.length };
        } catch (error) {
            this.logger.error(`Error subscribing all providers to channel ${channel}:`, error);
            return { success: false, count: 0 };
        }
    }

    /**
     * Send notification to a specific channel
     */
    async sendNotificationToChannel(
        channel: ChannelType,
        title: string,
        message: string,
        imageUrl?: string,
        data?: Record<string, string>
    ): Promise<boolean> {
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
            } else {
                this.logger.error(`Failed to send notification to channel ${channel}: ${result.error}`);
            }

            return result.success;
        } catch (error) {
            this.logger.error(`Error sending notification to channel ${channel}:`, error);
            return false;
        }
    }

    /**
     * Get the FCM topic name for a channel
     */
    private getChannelTopic(channel: ChannelType): string {
        return `channel_${channel}`;
    }

    /**
     * Get channel statistics
     */
    async getChannelStatistics(): Promise<Record<ChannelType, { users: number; providers: number }>> {
        try {
            const [users, providers] = await Promise.all([
                this.prisma.user.count({ where: { fcmToken: { not: null } } }),
                this.prisma.provider.count({ where: { fcmToken: { not: null } } })
            ]);

            return {
                [ChannelType.USERS]: { users, providers: 0 },
                [ChannelType.PROVIDERS]: { users: 0, providers },
                [ChannelType.ALL]: { users, providers },
            };
        } catch (error) {
            this.logger.error('Error getting channel statistics:', error);
            return {
                [ChannelType.USERS]: { users: 0, providers: 0 },
                [ChannelType.PROVIDERS]: { users: 0, providers: 0 },
                [ChannelType.ALL]: { users: 0, providers: 0 },
            };
        }
    }
} 
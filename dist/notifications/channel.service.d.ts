import { PrismaService } from '../prisma/prisma.service';
import { FCMService } from './fcm.service';
import { ChannelType, SubscriptionAction } from './dto/channel.dto';
export declare class ChannelService {
    private prisma;
    private fcmService;
    private readonly logger;
    constructor(prisma: PrismaService, fcmService: FCMService);
    subscribeUserToChannel(userId: number, channel: ChannelType): Promise<boolean>;
    subscribeProviderToChannel(providerId: number, channel: ChannelType): Promise<boolean>;
    unsubscribeUserFromChannel(userId: number, channel: ChannelType): Promise<boolean>;
    unsubscribeProviderFromChannel(providerId: number, channel: ChannelType): Promise<boolean>;
    bulkSubscriptionAction(fcmTokens: string[], channel: ChannelType, action: SubscriptionAction): Promise<boolean>;
    subscribeAllUsersToChannel(channel: ChannelType): Promise<{
        success: boolean;
        count: number;
    }>;
    subscribeAllProvidersToChannel(channel: ChannelType): Promise<{
        success: boolean;
        count: number;
    }>;
    sendNotificationToChannel(channel: ChannelType, title: string, message: string, imageUrl?: string, data?: Record<string, string>): Promise<boolean>;
    private getChannelTopic;
    getChannelStatistics(): Promise<Record<ChannelType, {
        users: number;
        providers: number;
    }>>;
}

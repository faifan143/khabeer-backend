import { ChannelService } from './channel.service';
import { ChannelInitService } from './channel-init.service';
import { SubscribeToChannelDto, UnsubscribeFromChannelDto, BulkSubscriptionDto, ChannelType } from './dto/channel.dto';
export declare class ChannelController {
    private readonly channelService;
    private readonly channelInitService;
    constructor(channelService: ChannelService, channelInitService: ChannelInitService);
    subscribeUserToChannel(userId: number, subscribeDto: SubscribeToChannelDto): Promise<{
        success: boolean;
        message: string;
    }>;
    unsubscribeUserFromChannel(userId: number, unsubscribeDto: UnsubscribeFromChannelDto): Promise<{
        success: boolean;
        message: string;
    }>;
    subscribeProviderToChannel(providerId: number, subscribeDto: SubscribeToChannelDto): Promise<{
        success: boolean;
        message: string;
    }>;
    unsubscribeProviderFromChannel(providerId: number, unsubscribeDto: UnsubscribeFromChannelDto): Promise<{
        success: boolean;
        message: string;
    }>;
    bulkSubscriptionAction(bulkSubscriptionDto: BulkSubscriptionDto): Promise<{
        success: boolean;
        message: string;
    }>;
    subscribeAllUsersToChannel(channel: ChannelType): Promise<{
        success: boolean;
        count: number;
        message: string;
    }>;
    subscribeAllProvidersToChannel(channel: ChannelType): Promise<{
        success: boolean;
        count: number;
        message: string;
    }>;
    sendNotificationToChannel(channel: ChannelType, body: {
        title: string;
        message: string;
        imageUrl?: string;
        data?: Record<string, string>;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    getChannelStatistics(): Promise<{
        success: boolean;
        statistics: Record<ChannelType, {
            users: number;
            providers: number;
        }>;
    }>;
    reinitializeChannels(): Promise<{
        success: boolean;
        message: string;
    }>;
    healthCheck(): Promise<{
        status: string;
        service: string;
        timestamp: string;
    }>;
}

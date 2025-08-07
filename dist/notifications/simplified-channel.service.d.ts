import { ConfigService } from '@nestjs/config';
import { FCMService } from './fcm.service';
import { ChannelType } from './dto/channel.dto';
export declare class SimplifiedChannelService {
    private fcmService;
    private configService;
    private readonly logger;
    constructor(fcmService: FCMService, configService: ConfigService);
    sendNotificationToTopic(topic: string, title: string, message: string, data?: Record<string, string>, imageUrl?: string): Promise<boolean>;
    sendNotificationToTopics(topics: string[], title: string, message: string, data?: Record<string, string>, imageUrl?: string): Promise<{
        success: boolean;
        results: boolean[];
    }>;
    getTopicForChannel(channel: ChannelType): string;
    getAllTopics(): string[];
    sendToUsers(title: string, message: string, data?: Record<string, string>, imageUrl?: string): Promise<boolean>;
    sendToProviders(title: string, message: string, data?: Record<string, string>, imageUrl?: string): Promise<boolean>;
}

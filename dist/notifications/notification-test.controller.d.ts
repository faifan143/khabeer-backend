import { FCMService } from './fcm.service';
import { SimpleFCMService } from './simple-fcm.service';
import { SimplifiedChannelService } from './simplified-channel.service';
export declare class NotificationTestController {
    private readonly fcmService;
    private readonly simpleFCMService;
    private readonly simplifiedChannelService;
    constructor(fcmService: FCMService, simpleFCMService: SimpleFCMService, simplifiedChannelService: SimplifiedChannelService);
    testAllTopics(): Promise<{
        message: string;
        totalTopics: number;
        results: any[];
        timestamp: string;
    }>;
    testSpecificTopic(topic: string, body: {
        title?: string;
        body?: string;
        data?: Record<string, string>;
    }): Promise<{
        message: string;
        topic: string;
        success: boolean;
        messageId: string | undefined;
        error: string | undefined;
        payload: {
            title: string;
            body: string;
            data: {
                test: string;
                timestamp: string;
                topic: string;
                type: string;
            };
        };
        timestamp: string;
    }>;
    getTopicsInfo(): Promise<{
        message: string;
        totalTopics: number;
        topics: {
            topic: string;
            exists: boolean;
            lastMessageSent?: string;
            estimatedSubscribers?: number;
            topicName: string;
        }[];
        timestamp: string;
    }>;
    testUserToken(userId: number, body: {
        title?: string;
        body?: string;
        data?: Record<string, string>;
        imageUrl?: string;
    }): Promise<{
        message: string;
        userId: number;
        success: boolean;
        messageId: string | undefined;
        error: string | undefined;
        payload: {
            title: string;
            body: string;
            data: {
                test: string;
                timestamp: string;
                userId: string;
                type: string;
            };
            imageUrl: string | undefined;
        };
        timestamp: string;
    }>;
    testProviderToken(providerId: number, body: {
        title?: string;
        body?: string;
        data?: Record<string, string>;
        imageUrl?: string;
    }): Promise<{
        message: string;
        providerId: number;
        success: boolean;
        messageId: string | undefined;
        error: string | undefined;
        payload: {
            title: string;
            body: string;
            data: {
                test: string;
                timestamp: string;
                providerId: string;
                type: string;
            };
            imageUrl: string | undefined;
        };
        timestamp: string;
    }>;
    testAllUsersTokens(body: {
        title?: string;
        body?: string;
        data?: Record<string, string>;
        imageUrl?: string;
    }): Promise<{
        message: string;
        success: boolean;
        sentCount: number;
        totalCount: number;
        payload: {
            title: string;
            body: string;
            data: {
                test: string;
                timestamp: string;
                type: string;
            };
            imageUrl: string | undefined;
        };
        timestamp: string;
    }>;
    testAllProvidersTokens(body: {
        title?: string;
        body?: string;
        data?: Record<string, string>;
        imageUrl?: string;
    }): Promise<{
        message: string;
        success: boolean;
        sentCount: number;
        totalCount: number;
        payload: {
            title: string;
            body: string;
            data: {
                test: string;
                timestamp: string;
                type: string;
            };
            imageUrl: string | undefined;
        };
        timestamp: string;
    }>;
    compareTopicVsToken(body: {
        title?: string;
        body?: string;
        data?: Record<string, string>;
        imageUrl?: string;
        targetAudience: 'users' | 'providers' | 'both';
    }): Promise<any>;
    getSystemStatus(): Promise<{
        message: string;
        status: string;
        firebaseInitialized: boolean;
        availableTopics: {
            topic: string;
            exists: boolean;
            lastMessageSent?: string;
            estimatedSubscribers?: number;
            topicName: string;
        }[];
        totalTopics: number;
        timestamp: string;
        services: {
            fcmService: string;
            simpleFCMService: string;
            simplifiedChannelService: string;
        };
    }>;
}

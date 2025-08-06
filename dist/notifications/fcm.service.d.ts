import { ConfigService } from '@nestjs/config';
export interface FCMNotificationPayload {
    title: string;
    body: string;
    imageUrl?: string;
    data?: Record<string, string>;
}
export interface FCMResult {
    success: boolean;
    messageId?: string;
    error?: string;
}
export declare class FCMService {
    private configService;
    private readonly logger;
    private firebaseApp;
    constructor(configService: ConfigService);
    private initializeFirebase;
    sendToToken(token: string, payload: FCMNotificationPayload): Promise<FCMResult>;
    sendToMultipleTokens(tokens: string[], payload: FCMNotificationPayload): Promise<FCMResult[]>;
    sendToTopic(topic: string, payload: FCMNotificationPayload): Promise<FCMResult>;
    subscribeToTopic(tokens: string[], topic: string): Promise<boolean>;
    unsubscribeFromTopic(tokens: string[], topic: string): Promise<boolean>;
}

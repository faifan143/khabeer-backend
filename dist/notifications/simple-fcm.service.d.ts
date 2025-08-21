import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
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
export declare class SimpleFCMService {
    private configService;
    private prisma;
    private readonly logger;
    private firebaseApp;
    constructor(configService: ConfigService, prisma: PrismaService);
    private initializeFirebase;
    sendToUser(userId: number, payload: FCMNotificationPayload): Promise<FCMResult>;
    sendToProvider(providerId: number, payload: FCMNotificationPayload): Promise<FCMResult>;
    sendToAllUsers(payload: FCMNotificationPayload): Promise<{
        success: boolean;
        sentCount: number;
        totalCount: number;
    }>;
    sendToAllProviders(payload: FCMNotificationPayload): Promise<{
        success: boolean;
        sentCount: number;
        totalCount: number;
    }>;
}

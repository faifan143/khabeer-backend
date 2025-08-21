import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { SimplifiedChannelService } from './simplified-channel.service';
export declare class NotificationsService {
    private prisma;
    private simplifiedChannelService;
    private readonly logger;
    constructor(prisma: PrismaService, simplifiedChannelService: SimplifiedChannelService);
    createNotification(createNotificationDto: CreateNotificationDto): Promise<{
        status: string;
        sentAt: Date;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        data: import("generated/prisma/runtime/library").JsonValue | null;
        message: string;
        imageUrl: string | null;
        targetAudience: import("generated/prisma/runtime/library").JsonValue;
        notificationType: string;
        recipientsCount: number;
        failureCount: number;
        successCount: number;
    }>;
    sendNotification(notificationId: number): Promise<{
        success: boolean;
        results: boolean[];
    }>;
    private mapTargetAudienceToTopics;
    sendOrderNotification(orderId: number, title: string, message: string, data?: Record<string, any>, imageUrl?: string): Promise<{
        success: boolean;
        message: string;
    }>;
    sendOfferNotification(offerId: number, title: string, message: string, data?: Record<string, any>, imageUrl?: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getAllNotifications(page?: number, limit?: number): Promise<{
        notifications: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            data: import("generated/prisma/runtime/library").JsonValue | null;
            message: string;
            imageUrl: string | null;
            status: string;
            targetAudience: import("generated/prisma/runtime/library").JsonValue;
            notificationType: string;
            recipientsCount: number;
            sentAt: Date | null;
            failureCount: number;
            successCount: number;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    getNotificationById(id: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        data: import("generated/prisma/runtime/library").JsonValue | null;
        message: string;
        imageUrl: string | null;
        status: string;
        targetAudience: import("generated/prisma/runtime/library").JsonValue;
        notificationType: string;
        recipientsCount: number;
        sentAt: Date | null;
        failureCount: number;
        successCount: number;
    }>;
    deleteNotification(id: number): Promise<{
        success: boolean;
    }>;
    getTopicInfo(): Promise<{
        topics: ({
            topic: string;
            description: string;
            lastMessageSent: string | null;
            messageCount: number;
            recentMessages: any[];
        } | {
            topic: string;
            description: string;
            lastMessageSent: string | null;
            messageCount: number;
            recentMessages: any[];
        })[];
        totalTopics: number;
        lastUpdated: string;
    }>;
    sendNotificationToTopics(topics: string[], title: string, message: string, data?: Record<string, string>, imageUrl?: string): Promise<{
        success: boolean;
        results: boolean[];
    }>;
}

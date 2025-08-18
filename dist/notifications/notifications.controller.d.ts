import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
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
        successCount: number;
        failureCount: number;
    }>;
    sendNotification(id: number): Promise<{
        success: boolean;
        results: boolean[];
    }>;
    getAllNotifications(page?: number, limit?: number): Promise<{
        notifications: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            data: import("generated/prisma/runtime/library").JsonValue | null;
            message: string;
            status: string;
            sentAt: Date | null;
            imageUrl: string | null;
            targetAudience: import("generated/prisma/runtime/library").JsonValue;
            notificationType: string;
            recipientsCount: number;
            successCount: number;
            failureCount: number;
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
        status: string;
        sentAt: Date | null;
        imageUrl: string | null;
        targetAudience: import("generated/prisma/runtime/library").JsonValue;
        notificationType: string;
        recipientsCount: number;
        successCount: number;
        failureCount: number;
    }>;
    deleteNotification(id: number): Promise<{
        success: boolean;
    }>;
    sendOrderNotification(orderId: number, body: {
        title: string;
        message: string;
        data?: Record<string, any>;
        imageUrl?: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    sendOfferNotification(offerId: number, body: {
        title: string;
        message: string;
        data?: Record<string, any>;
        imageUrl?: string;
    }): Promise<{
        success: boolean;
        message: string;
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
    testTopics(): Promise<{
        message: string;
        results: any[];
        timestamp: string;
    }>;
}

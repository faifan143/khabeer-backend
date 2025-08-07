import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    createNotification(createNotificationDto: CreateNotificationDto): Promise<{
        status: string;
        sentAt: Date;
        data: import("generated/prisma/runtime/library").JsonValue | null;
        title: string;
        message: string;
        imageUrl: string | null;
        targetAudience: import("generated/prisma/runtime/library").JsonValue;
        notificationType: string;
        recipientsCount: number;
        successCount: number;
        failureCount: number;
        createdAt: Date;
        updatedAt: Date;
        id: number;
    }>;
    sendNotification(id: number): Promise<{
        success: boolean;
        results: boolean[];
    }>;
    getAllNotifications(page?: number, limit?: number): Promise<{
        notifications: {
            data: import("generated/prisma/runtime/library").JsonValue | null;
            title: string;
            message: string;
            imageUrl: string | null;
            targetAudience: import("generated/prisma/runtime/library").JsonValue;
            notificationType: string;
            status: string;
            recipientsCount: number;
            successCount: number;
            failureCount: number;
            sentAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
            id: number;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    getNotificationById(id: number): Promise<{
        data: import("generated/prisma/runtime/library").JsonValue | null;
        title: string;
        message: string;
        imageUrl: string | null;
        targetAudience: import("generated/prisma/runtime/library").JsonValue;
        notificationType: string;
        status: string;
        recipientsCount: number;
        successCount: number;
        failureCount: number;
        sentAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        id: number;
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

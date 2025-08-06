import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateFcmTokenDto } from './dto/update-fcm-token.dto';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    createNotification(createNotificationDto: CreateNotificationDto): Promise<{
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
    sendNotification(id: number): Promise<{
        success: boolean;
        recipientsCount: number;
        successCount: number;
        failureCount: number;
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
    updateUserFcmToken(userId: number, updateFcmTokenDto: UpdateFcmTokenDto): Promise<{
        success: boolean;
    }>;
    updateProviderFcmToken(providerId: number, updateFcmTokenDto: UpdateFcmTokenDto): Promise<{
        success: boolean;
    }>;
    sendOrderNotification(orderId: number, body: {
        title: string;
        message: string;
        data?: Record<string, any>;
    }): Promise<{
        success: boolean;
        message: string;
        recipientsCount?: undefined;
        results?: undefined;
    } | {
        success: boolean;
        recipientsCount: number;
        results: import("./fcm.service").FCMResult[];
        message?: undefined;
    }>;
    sendOfferNotification(offerId: number, body: {
        title: string;
        message: string;
        data?: Record<string, any>;
    }): Promise<{
        success: boolean;
        message: string;
        recipientsCount?: undefined;
        results?: undefined;
    } | {
        success: boolean;
        recipientsCount: number;
        results: import("./fcm.service").FCMResult[];
        message?: undefined;
    }>;
}

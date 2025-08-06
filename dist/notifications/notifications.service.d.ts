import { PrismaService } from '../prisma/prisma.service';
import { FCMService } from './fcm.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { ChannelService } from './channel.service';
export declare class NotificationsService {
    private prisma;
    private fcmService;
    private channelService;
    private readonly logger;
    constructor(prisma: PrismaService, fcmService: FCMService, channelService: ChannelService);
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
    sendNotification(notificationId: number): Promise<{
        success: boolean;
        recipientsCount: number;
        successCount: number;
        failureCount: number;
    }>;
    private sendNotificationToChannels;
    private mapTargetAudienceToChannel;
    private getTargetAudienceTokens;
    updateUserFcmToken(userId: number, fcmToken: string): Promise<{
        success: boolean;
    }>;
    updateProviderFcmToken(providerId: number, fcmToken: string): Promise<{
        success: boolean;
    }>;
    sendOrderNotification(orderId: number, title: string, message: string, data?: Record<string, any>): Promise<{
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
    sendOfferNotification(offerId: number, title: string, message: string, data?: Record<string, any>): Promise<{
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
}

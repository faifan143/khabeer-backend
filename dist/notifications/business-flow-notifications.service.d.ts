import { PrismaService } from '../prisma/prisma.service';
import { FCMService } from './fcm.service';
import { SimpleFCMService } from './simple-fcm.service';
import { SimplifiedChannelService } from './simplified-channel.service';
export interface NotificationData {
    title: string;
    body: string;
    data?: Record<string, string>;
    imageUrl?: string;
}
export declare class BusinessFlowNotificationsService {
    private readonly prisma;
    private readonly fcmService;
    private readonly simpleFCMService;
    private readonly simplifiedChannelService;
    private readonly logger;
    constructor(prisma: PrismaService, fcmService: FCMService, simpleFCMService: SimpleFCMService, simplifiedChannelService: SimplifiedChannelService);
    notifyNewOrder(orderId: number, providerId: number, serviceName: string, customerName: string): Promise<{
        success: boolean;
        providerId: number;
        orderId: number;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        providerId?: undefined;
        orderId?: undefined;
    } | undefined>;
    notifyOrderStatusUpdate(orderId: number, customerId: number, status: string, providerName: string): Promise<{
        success: boolean;
        customerId: number;
        orderId: number;
        status: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        customerId?: undefined;
        orderId?: undefined;
        status?: undefined;
    } | undefined>;
    notifyPaymentSuccess(orderId: number, customerId: number, providerId: number, amount: number): Promise<{
        success: boolean;
        orderId: number;
        customerId: number;
        providerId: number;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        orderId?: undefined;
        customerId?: undefined;
        providerId?: undefined;
    }>;
    notifyPaymentFailure(orderId: number, customerId: number, errorMessage: string): Promise<{
        success: boolean;
        customerId: number;
        orderId: number;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        customerId?: undefined;
        orderId?: undefined;
    } | undefined>;
    notifyNewRating(ratingId: number, providerId: number, customerName: string, rating: number, comment?: string): Promise<{
        success: boolean;
        providerId: number;
        ratingId: number;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        providerId?: undefined;
        ratingId?: undefined;
    } | undefined>;
    notifyRatingUpdate(ratingId: number, providerId: number, customerName: string, oldRating: number, newRating: number): Promise<{
        success: boolean;
        providerId: number;
        ratingId: number;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        providerId?: undefined;
        ratingId?: undefined;
    } | undefined>;
    notifyNewService(serviceId: number, serviceName: string, providerName: string, category: string): Promise<{
        success: boolean;
        serviceId: number;
        serviceName: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        serviceId?: undefined;
        serviceName?: undefined;
    }>;
    notifyServiceUpdate(serviceId: number, serviceName: string, providerName: string, changes: string[]): Promise<{
        success: boolean;
        serviceId: number;
        serviceName: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        serviceId?: undefined;
        serviceName?: undefined;
    }>;
    notifyNewOffer(offerId: number, offerTitle: string, providerName: string, discount: string, serviceName: string): Promise<{
        success: boolean;
        offerId: number;
        offerTitle: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        offerId?: undefined;
        offerTitle?: undefined;
    }>;
    notifyOfferExpired(offerId: number, offerTitle: string, providerName: string): Promise<{
        success: boolean;
        offerId: number;
        offerTitle: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        offerId?: undefined;
        offerTitle?: undefined;
    }>;
    notifySystemMaintenance(message: string, scheduledTime?: string, duration?: string): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message?: undefined;
    }>;
    sendGeneralAnnouncement(title: string, message: string, targetAudience?: 'users' | 'providers' | 'all'): Promise<{
        success: boolean;
        targetAudience: "users" | "providers" | "all";
        title: string;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        targetAudience?: undefined;
        title?: undefined;
        message?: undefined;
    }>;
}

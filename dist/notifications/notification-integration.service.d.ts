import { NotificationsService } from './notifications.service';
export declare class NotificationIntegrationService {
    private notificationsService;
    private readonly logger;
    constructor(notificationsService: NotificationsService);
    handleOrderStatusChange(orderId: number, newStatus: string, previousStatus: string): Promise<void>;
    handleNewOffer(offerId: number, offerTitle: string, providerName: string): Promise<void>;
    handleProviderVerificationStatusChange(providerId: number, status: string, providerName: string): Promise<void>;
    sendWelcomeNotification(userId: number, userType: 'user' | 'provider'): Promise<void>;
    sendSystemMaintenanceNotification(maintenanceMessage: string, scheduledTime?: string): Promise<void>;
    sendPromotionalNotification(title: string, message: string, targetAudience: string[], imageUrl?: string): Promise<void>;
}

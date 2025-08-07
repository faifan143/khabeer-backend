import { Injectable, Logger } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { TargetAudience, NotificationType } from './dto/create-notification.dto';

@Injectable()
export class NotificationIntegrationService {
    private readonly logger = new Logger(NotificationIntegrationService.name);

    constructor(private notificationsService: NotificationsService) { }

    /**
     * Send notification when order status changes
     */
    async handleOrderStatusChange(orderId: number, newStatus: string, previousStatus: string) {
        try {
            let title = '';
            let message = '';
            let data: Record<string, any> = {};

            switch (newStatus) {
                case 'accepted':
                    title = 'Order Accepted!';
                    message = 'Your order has been accepted by the provider and is being prepared.';
                    data = { orderStatus: 'accepted', action: 'view_order' };
                    break;

                case 'in_progress':
                    title = 'Order In Progress';
                    message = 'The provider has started working on your order.';
                    data = { orderStatus: 'in_progress', action: 'track_order' };
                    break;

                case 'completed':
                    title = 'Order Completed!';
                    message = 'Your order has been completed successfully. Please rate your experience.';
                    data = { orderStatus: 'completed', action: 'rate_order' };
                    break;

                case 'cancelled':
                    title = 'Order Cancelled';
                    message = 'Your order has been cancelled.';
                    data = { orderStatus: 'cancelled', action: 'view_order' };
                    break;

                default:
                    this.logger.log(`No notification needed for status change: ${previousStatus} -> ${newStatus}`);
                    return;
            }

            await this.notificationsService.sendOrderNotification(orderId, title, message, data);
            this.logger.log(`Order status change notification sent for order ${orderId}: ${newStatus}`);
        } catch (error) {
            this.logger.error(`Failed to send order status change notification for order ${orderId}:`, error);
        }
    }

    /**
     * Send notification when a new offer is created
     */
    async handleNewOffer(offerId: number, offerTitle: string, providerName: string) {
        try {
            const title = 'New Special Offer!';
            const message = `${providerName} has a new offer: ${offerTitle}`;
            const data = { offerId: offerId.toString(), action: 'view_offer' };

            await this.notificationsService.sendOfferNotification(offerId, title, message, data);
            this.logger.log(`New offer notification sent for offer ${offerId}`);
        } catch (error) {
            this.logger.error(`Failed to send new offer notification for offer ${offerId}:`, error);
        }
    }

    /**
     * Send notification when provider verification status changes
     */
    async handleProviderVerificationStatusChange(providerId: number, status: string, providerName: string) {
        try {
            let title = '';
            let message = '';

            switch (status) {
                case 'approved':
                    title = 'Account Verified!';
                    message = `Congratulations ${providerName}! Your account has been verified and you can now accept orders.`;
                    break;

                case 'rejected':
                    title = 'Verification Update';
                    message = `Dear ${providerName}, your account verification requires additional information. Please check your email for details.`;
                    break;

                default:
                    return;
            }

            // Send to providers channel
            await this.notificationsService['simplifiedChannelService'].sendToProviders(
                title,
                message,
                {
                    providerId: providerId.toString(),
                    notificationType: 'system',
                    action: 'view_profile',
                }
            );

            this.logger.log(`Provider verification notification sent for provider ${providerId}: ${status}`);
        } catch (error) {
            this.logger.error(`Failed to send provider verification notification for provider ${providerId}:`, error);
        }
    }

    /**
     * Send welcome notification to new users
     */
    async sendWelcomeNotification(userId: number, userType: 'user' | 'provider') {
        try {
            const title = 'Welcome to Khabeer!';
            const message = userType === 'user'
                ? 'Thank you for joining Khabeer! Discover amazing services from verified providers.'
                : 'Welcome to Khabeer! Start offering your services to customers.';

            const data = {
                notificationType: 'system',
                action: userType === 'user' ? 'browse_services' : 'complete_profile',
            };

            // Send to appropriate channel based on user type
            if (userType === 'user') {
                await this.notificationsService['simplifiedChannelService'].sendToUsers(title, message, data);
            } else {
                await this.notificationsService['simplifiedChannelService'].sendToProviders(title, message, data);
            }

            this.logger.log(`Welcome notification sent to ${userType} channel for user ${userId}`);
        } catch (error) {
            this.logger.error(`Failed to send welcome notification for ${userType} ${userId}:`, error);
        }
    }

    /**
     * Send system maintenance notification
     */
    async sendSystemMaintenanceNotification(maintenanceMessage: string, scheduledTime?: string) {
        try {
            const title = 'System Maintenance Notice';
            const message = scheduledTime
                ? `Scheduled maintenance on ${scheduledTime}: ${maintenanceMessage}`
                : maintenanceMessage;

            const notification = await this.notificationsService.createNotification({
                title,
                message,
                targetAudience: [TargetAudience.CUSTOMERS, TargetAudience.PROVIDERS],
                notificationType: NotificationType.SYSTEM,
                data: {
                    action: 'system_notice',
                    scheduledTime: scheduledTime || 'immediate',
                },
            });

            await this.notificationsService.sendNotification(notification.id);
            this.logger.log('System maintenance notification sent to all users');
        } catch (error) {
            this.logger.error('Failed to send system maintenance notification:', error);
        }
    }

    /**
     * Send promotional notification
     */
    async sendPromotionalNotification(title: string, message: string, targetAudience: string[], imageUrl?: string) {
        try {
            const notification = await this.notificationsService.createNotification({
                title,
                message,
                imageUrl,
                targetAudience: targetAudience as any,
                notificationType: NotificationType.GENERAL,
                data: {
                    action: 'view_promotion',
                    type: 'promotional',
                },
            });

            await this.notificationsService.sendNotification(notification.id);
            this.logger.log(`Promotional notification sent to ${targetAudience.join(', ')}`);
        } catch (error) {
            this.logger.error('Failed to send promotional notification:', error);
        }
    }
} 
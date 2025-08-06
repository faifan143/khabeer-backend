"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var NotificationIntegrationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationIntegrationService = void 0;
const common_1 = require("@nestjs/common");
const notifications_service_1 = require("./notifications.service");
const create_notification_dto_1 = require("./dto/create-notification.dto");
let NotificationIntegrationService = NotificationIntegrationService_1 = class NotificationIntegrationService {
    notificationsService;
    logger = new common_1.Logger(NotificationIntegrationService_1.name);
    constructor(notificationsService) {
        this.notificationsService = notificationsService;
    }
    async handleOrderStatusChange(orderId, newStatus, previousStatus) {
        try {
            let title = '';
            let message = '';
            let data = {};
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
        }
        catch (error) {
            this.logger.error(`Failed to send order status change notification for order ${orderId}:`, error);
        }
    }
    async handleNewOffer(offerId, offerTitle, providerName) {
        try {
            const title = 'New Special Offer!';
            const message = `${providerName} has a new offer: ${offerTitle}`;
            const data = { offerId: offerId.toString(), action: 'view_offer' };
            await this.notificationsService.sendOfferNotification(offerId, title, message, data);
            this.logger.log(`New offer notification sent for offer ${offerId}`);
        }
        catch (error) {
            this.logger.error(`Failed to send new offer notification for offer ${offerId}:`, error);
        }
    }
    async handleProviderVerificationStatusChange(providerId, status, providerName) {
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
            const provider = await this.notificationsService['prisma'].provider.findUnique({
                where: { id: providerId },
                select: { fcmToken: true },
            });
            if (provider?.fcmToken) {
                await this.notificationsService['fcmService'].sendToToken(provider.fcmToken, {
                    title,
                    body: message,
                    data: {
                        providerId: providerId.toString(),
                        notificationType: 'system',
                        action: 'view_profile',
                    },
                });
            }
            this.logger.log(`Provider verification notification sent for provider ${providerId}: ${status}`);
        }
        catch (error) {
            this.logger.error(`Failed to send provider verification notification for provider ${providerId}:`, error);
        }
    }
    async sendWelcomeNotification(userId, userType) {
        try {
            const title = 'Welcome to Khabeer!';
            const message = userType === 'user'
                ? 'Thank you for joining Khabeer! Discover amazing services from verified providers.'
                : 'Welcome to Khabeer! Start offering your services to customers.';
            const data = {
                notificationType: 'system',
                action: userType === 'user' ? 'browse_services' : 'complete_profile',
            };
            if (userType === 'user') {
                await this.notificationsService.updateUserFcmToken(userId, 'temp_token');
            }
            else {
                await this.notificationsService.updateProviderFcmToken(userId, 'temp_token');
            }
            this.logger.log(`Welcome notification prepared for ${userType} ${userId}`);
        }
        catch (error) {
            this.logger.error(`Failed to send welcome notification for ${userType} ${userId}:`, error);
        }
    }
    async sendSystemMaintenanceNotification(maintenanceMessage, scheduledTime) {
        try {
            const title = 'System Maintenance Notice';
            const message = scheduledTime
                ? `Scheduled maintenance on ${scheduledTime}: ${maintenanceMessage}`
                : maintenanceMessage;
            const notification = await this.notificationsService.createNotification({
                title,
                message,
                targetAudience: [create_notification_dto_1.TargetAudience.ALL],
                notificationType: create_notification_dto_1.NotificationType.SYSTEM,
                data: {
                    action: 'system_notice',
                    scheduledTime: scheduledTime || 'immediate',
                },
            });
            await this.notificationsService.sendNotification(notification.id);
            this.logger.log('System maintenance notification sent to all users');
        }
        catch (error) {
            this.logger.error('Failed to send system maintenance notification:', error);
        }
    }
    async sendPromotionalNotification(title, message, targetAudience, imageUrl) {
        try {
            const notification = await this.notificationsService.createNotification({
                title,
                message,
                imageUrl,
                targetAudience: targetAudience,
                notificationType: create_notification_dto_1.NotificationType.GENERAL,
                data: {
                    action: 'view_promotion',
                    type: 'promotional',
                },
            });
            await this.notificationsService.sendNotification(notification.id);
            this.logger.log(`Promotional notification sent to ${targetAudience.join(', ')}`);
        }
        catch (error) {
            this.logger.error('Failed to send promotional notification:', error);
        }
    }
};
exports.NotificationIntegrationService = NotificationIntegrationService;
exports.NotificationIntegrationService = NotificationIntegrationService = NotificationIntegrationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [notifications_service_1.NotificationsService])
], NotificationIntegrationService);
//# sourceMappingURL=notification-integration.service.js.map
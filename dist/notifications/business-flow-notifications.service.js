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
var BusinessFlowNotificationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessFlowNotificationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const fcm_service_1 = require("./fcm.service");
const simple_fcm_service_1 = require("./simple-fcm.service");
const simplified_channel_service_1 = require("./simplified-channel.service");
let BusinessFlowNotificationsService = BusinessFlowNotificationsService_1 = class BusinessFlowNotificationsService {
    prisma;
    fcmService;
    simpleFCMService;
    simplifiedChannelService;
    logger = new common_1.Logger(BusinessFlowNotificationsService_1.name);
    constructor(prisma, fcmService, simpleFCMService, simplifiedChannelService) {
        this.prisma = prisma;
        this.fcmService = fcmService;
        this.simpleFCMService = simpleFCMService;
        this.simplifiedChannelService = simplifiedChannelService;
    }
    async notifyNewOrder(orderId, providerId, serviceName, customerName) {
        try {
            const provider = await this.prisma.provider.findUnique({
                where: { id: providerId },
                select: { name: true, fcm: true }
            });
            if (!provider) {
                this.logger.warn(`Provider ${providerId} not found for order ${orderId}`);
                return;
            }
            const notificationData = {
                title: '🆕 New Order Received',
                body: `You have a new order for ${serviceName} from ${customerName}`,
                data: {
                    type: 'new_order',
                    orderId: orderId.toString(),
                    serviceName,
                    customerName,
                    action: 'view_order'
                }
            };
            if (provider.fcm) {
                await this.simpleFCMService.sendToProvider(providerId, notificationData);
                this.logger.log(`FCM notification sent to provider ${providerId} for order ${orderId}`);
            }
            await this.simplifiedChannelService.sendToProviders(notificationData.title, notificationData.body, notificationData.data);
            return { success: true, providerId, orderId };
        }
        catch (error) {
            this.logger.error(`Failed to send new order notification: ${error.message}`);
            return { success: false, error: error.message };
        }
    }
    async notifyOrderStatusUpdate(orderId, customerId, status, providerName) {
        try {
            const customer = await this.prisma.user.findUnique({
                where: { id: customerId },
                select: { name: true, fcm: true }
            });
            if (!customer) {
                this.logger.warn(`Customer ${customerId} not found for order ${orderId}`);
                return;
            }
            const statusMessages = {
                'ACCEPTED': 'Your order has been accepted',
                'IN_PROGRESS': 'Your order is now in progress',
                'COMPLETED': 'Your order has been completed',
                'CANCELLED': 'Your order has been cancelled',
                'REJECTED': 'Your order has been rejected'
            };
            const notificationData = {
                title: `📋 Order ${status}`,
                body: `${statusMessages[status] || 'Order status updated'} by ${providerName}`,
                data: {
                    type: 'order_status_update',
                    orderId: orderId.toString(),
                    status,
                    providerName,
                    action: 'view_order'
                }
            };
            if (customer.fcm) {
                await this.simpleFCMService.sendToUser(customerId, notificationData);
                this.logger.log(`FCM notification sent to customer ${customerId} for order ${orderId}`);
            }
            await this.simplifiedChannelService.sendToUsers(notificationData.title, notificationData.body, notificationData.data);
            return { success: true, customerId, orderId, status };
        }
        catch (error) {
            this.logger.error(`Failed to send order status notification: ${error.message}`);
            return { success: false, error: error.message };
        }
    }
    async notifyPaymentSuccess(orderId, customerId, providerId, amount) {
        try {
            const [customer, provider] = await Promise.all([
                this.prisma.user.findUnique({
                    where: { id: customerId },
                    select: { name: true, fcm: true }
                }),
                this.prisma.provider.findUnique({
                    where: { id: providerId },
                    select: { name: true, fcm: true }
                })
            ]);
            if (customer?.fcm) {
                const customerNotification = {
                    title: '💳 Payment Successful',
                    body: `Payment of $${amount} has been processed successfully`,
                    data: {
                        type: 'payment_success',
                        orderId: orderId.toString(),
                        amount: amount.toString(),
                        action: 'view_order'
                    }
                };
                await this.simpleFCMService.sendToUser(customerId, customerNotification);
            }
            if (provider?.fcm) {
                const providerNotification = {
                    title: '💰 Payment Received',
                    body: `Payment of $${amount} has been received for order #${orderId}`,
                    data: {
                        type: 'payment_received',
                        orderId: orderId.toString(),
                        amount: amount.toString(),
                        action: 'view_order'
                    }
                };
                await this.simpleFCMService.sendToProvider(providerId, providerNotification);
            }
            await Promise.all([
                this.simplifiedChannelService.sendToUsers('💳 Payment Successful', 'Your payment has been processed successfully', { type: 'payment_success', action: 'view_orders' }),
                this.simplifiedChannelService.sendToProviders('💰 Payment Received', 'A new payment has been received', { type: 'payment_received', action: 'view_orders' })
            ]);
            return { success: true, orderId, customerId, providerId };
        }
        catch (error) {
            this.logger.error(`Failed to send payment success notification: ${error.message}`);
            return { success: false, error: error.message };
        }
    }
    async notifyPaymentFailure(orderId, customerId, errorMessage) {
        try {
            const customer = await this.prisma.user.findUnique({
                where: { id: customerId },
                select: { name: true, fcm: true }
            });
            if (!customer)
                return;
            const notificationData = {
                title: '❌ Payment Failed',
                body: `Payment failed: ${errorMessage}. Please try again.`,
                data: {
                    type: 'payment_failed',
                    orderId: orderId.toString(),
                    errorMessage,
                    action: 'retry_payment'
                }
            };
            if (customer.fcm) {
                await this.simpleFCMService.sendToUser(customerId, notificationData);
            }
            await this.simplifiedChannelService.sendToUsers(notificationData.title, notificationData.body, notificationData.data);
            return { success: true, customerId, orderId };
        }
        catch (error) {
            this.logger.error(`Failed to send payment failure notification: ${error.message}`);
            return { success: false, error: error.message };
        }
    }
    async notifyNewRating(ratingId, providerId, customerName, rating, comment) {
        try {
            const provider = await this.prisma.provider.findUnique({
                where: { id: providerId },
                select: { name: true, fcm: true }
            });
            if (!provider)
                return;
            const stars = '⭐'.repeat(rating);
            const notificationData = {
                title: `${stars} New Rating Received`,
                body: `${customerName} gave you ${rating} stars${comment ? `: "${comment}"` : ''}`,
                data: {
                    type: 'new_rating',
                    ratingId: ratingId.toString(),
                    providerId: providerId.toString(),
                    rating: rating.toString(),
                    customerName,
                    action: 'view_rating'
                }
            };
            if (provider.fcm) {
                await this.simpleFCMService.sendToProvider(providerId, notificationData);
            }
            await this.simplifiedChannelService.sendToProviders(notificationData.title, notificationData.body, notificationData.data);
            return { success: true, providerId, ratingId };
        }
        catch (error) {
            this.logger.error(`Failed to send new rating notification: ${error.message}`);
            return { success: false, error: error.message };
        }
    }
    async notifyRatingUpdate(ratingId, providerId, customerName, oldRating, newRating) {
        try {
            const provider = await this.prisma.provider.findUnique({
                where: { id: providerId },
                select: { name: true, fcm: true }
            });
            if (!provider)
                return;
            const notificationData = {
                title: '🔄 Rating Updated',
                body: `${customerName} updated their rating from ${oldRating} to ${newRating} stars`,
                data: {
                    type: 'rating_updated',
                    ratingId: ratingId.toString(),
                    providerId: providerId.toString(),
                    oldRating: oldRating.toString(),
                    newRating: newRating.toString(),
                    customerName,
                    action: 'view_rating'
                }
            };
            if (provider.fcm) {
                await this.simpleFCMService.sendToProvider(providerId, notificationData);
            }
            return { success: true, providerId, ratingId };
        }
        catch (error) {
            this.logger.error(`Failed to send rating update notification: ${error.message}`);
            return { success: false, error: error.message };
        }
    }
    async notifyNewService(serviceId, serviceName, providerName, category) {
        try {
            const notificationData = {
                title: '🆕 New Service Available',
                body: `${providerName} added "${serviceName}" in ${category}`,
                data: {
                    type: 'new_service',
                    serviceId: serviceId.toString(),
                    serviceName,
                    providerName,
                    category,
                    action: 'view_service'
                }
            };
            await this.simplifiedChannelService.sendToUsers(notificationData.title, notificationData.body, notificationData.data);
            await this.simplifiedChannelService.sendToProviders('🆕 New Service Added', `A new service "${serviceName}" has been added to the platform`, { type: 'new_service', action: 'view_services' });
            return { success: true, serviceId, serviceName };
        }
        catch (error) {
            this.logger.error(`Failed to send new service notification: ${error.message}`);
            return { success: false, error: error.message };
        }
    }
    async notifyServiceUpdate(serviceId, serviceName, providerName, changes) {
        try {
            const notificationData = {
                title: '🔄 Service Updated',
                body: `${serviceName} by ${providerName} has been updated`,
                data: {
                    type: 'service_updated',
                    serviceId: serviceId.toString(),
                    serviceName,
                    providerName,
                    changes: changes.join(', '),
                    action: 'view_service'
                }
            };
            await this.simplifiedChannelService.sendToUsers(notificationData.title, notificationData.body, notificationData.data);
            return { success: true, serviceId, serviceName };
        }
        catch (error) {
            this.logger.error(`Failed to send service update notification: ${error.message}`);
            return { success: false, error: error.message };
        }
    }
    async notifyNewOffer(offerId, offerTitle, providerName, discount, serviceName) {
        try {
            const notificationData = {
                title: '🎉 Special Offer Available',
                body: `${providerName} is offering ${discount} off on ${serviceName}`,
                data: {
                    type: 'new_offer',
                    offerId: offerId.toString(),
                    offerTitle,
                    providerName,
                    discount,
                    serviceName,
                    action: 'view_offer'
                }
            };
            await this.simplifiedChannelService.sendToUsers(notificationData.title, notificationData.body, notificationData.data);
            await this.simplifiedChannelService.sendToProviders('🎉 New Offer Created', `A new offer "${offerTitle}" has been created`, { type: 'new_offer', action: 'view_offers' });
            return { success: true, offerId, offerTitle };
        }
        catch (error) {
            this.logger.error(`Failed to send new offer notification: ${error.message}`);
            return { success: false, error: error.message };
        }
    }
    async notifyOfferExpired(offerId, offerTitle, providerName) {
        try {
            const notificationData = {
                title: '⏰ Offer Expired',
                body: `The offer "${offerTitle}" by ${providerName} has expired`,
                data: {
                    type: 'offer_expired',
                    offerId: offerId.toString(),
                    offerTitle,
                    providerName,
                    action: 'view_expired_offers'
                }
            };
            await this.simplifiedChannelService.sendToUsers(notificationData.title, notificationData.body, notificationData.data);
            return { success: true, offerId, offerTitle };
        }
        catch (error) {
            this.logger.error(`Failed to send offer expired notification: ${error.message}`);
            return { success: false, error: error.message };
        }
    }
    async notifySystemMaintenance(message, scheduledTime, duration) {
        try {
            const notificationData = {
                title: '🔧 System Maintenance',
                body: message,
                data: {
                    type: 'system_maintenance',
                    scheduledTime: scheduledTime || '',
                    duration: duration || '',
                    action: 'view_notice'
                }
            };
            await Promise.all([
                this.simplifiedChannelService.sendToUsers(notificationData.title, notificationData.body, notificationData.data),
                this.simplifiedChannelService.sendToProviders(notificationData.title, notificationData.body, notificationData.data)
            ]);
            return { success: true, message };
        }
        catch (error) {
            this.logger.error(`Failed to send system maintenance notification: ${error.message}`);
            return { success: false, error: error.message };
        }
    }
    async sendGeneralAnnouncement(title, message, targetAudience = 'all') {
        try {
            const notificationData = {
                title,
                body: message,
                data: {
                    type: 'general_announcement',
                    timestamp: new Date().toISOString(),
                    action: 'view_announcement'
                }
            };
            if (targetAudience === 'users' || targetAudience === 'all') {
                await this.simplifiedChannelService.sendToUsers(notificationData.title, notificationData.body, notificationData.data);
            }
            if (targetAudience === 'providers' || targetAudience === 'all') {
                await this.simplifiedChannelService.sendToProviders(notificationData.title, notificationData.body, notificationData.data);
            }
            return { success: true, targetAudience, title, message };
        }
        catch (error) {
            this.logger.error(`Failed to send general announcement: ${error.message}`);
            return { success: false, error: error.message };
        }
    }
};
exports.BusinessFlowNotificationsService = BusinessFlowNotificationsService;
exports.BusinessFlowNotificationsService = BusinessFlowNotificationsService = BusinessFlowNotificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        fcm_service_1.FCMService,
        simple_fcm_service_1.SimpleFCMService,
        simplified_channel_service_1.SimplifiedChannelService])
], BusinessFlowNotificationsService);
//# sourceMappingURL=business-flow-notifications.service.js.map
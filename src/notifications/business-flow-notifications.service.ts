import { Injectable, Logger } from '@nestjs/common';
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

@Injectable()
export class BusinessFlowNotificationsService {
  private readonly logger = new Logger(BusinessFlowNotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly fcmService: FCMService,
    private readonly simpleFCMService: SimpleFCMService,
    private readonly simplifiedChannelService: SimplifiedChannelService,
  ) {}

  // ===== ORDER FLOW NOTIFICATIONS =====

  /**
   * New order created - notify provider
   */
  async notifyNewOrder(
    orderId: number,
    providerId: number,
    serviceName: string,
    customerName: string,
    serviceImage?: string,
    serviceTitleAr?: string,
    serviceTitleEn?: string,
    serviceTypeAr?: string,
    serviceTypeEn?: string,
  ) {
    try {
      // Get provider details
      const provider = await this.prisma.provider.findUnique({
        where: { id: providerId },
        select: { name: true, fcm: true },
      });

      if (!provider) {
        this.logger.warn(
          `Provider ${providerId} not found for order ${orderId}`,
        );
        return;
      }

      // Send data-only notification to specific provider via FCM token (if available)
      if (provider.fcm) {
        await this.simpleFCMService.sendNewOrderRequestToProvider(
          providerId,
          orderId.toString(),
          customerName,
          '123456789', // You may want to get actual phone from order data
          serviceTitleAr || serviceName,
          serviceTitleEn || serviceName,
          serviceTypeAr || 'Service',
          serviceTypeEn || 'Service',
        );
        this.logger.log(
          `FCM new order request sent to provider ${providerId} for order ${orderId}`,
        );
      }

      return { success: true, providerId, orderId };
    } catch (error) {
      this.logger.error(
        `Failed to send new order notification: ${error.message}`,
      );
      return { success: false, error: error.message };
    }
  }

  /**
   * Order status updated - notify customer
   */
  async notifyOrderStatusUpdate(
    orderId: number,
    customerId: number,
    status: string,
    providerName: string,
    providerImage?: string,
  ) {
    try {
      // Get customer details
      const customer = await this.prisma.user.findUnique({
        where: { id: customerId },
        select: { name: true, fcm: true },
      });

      if (!customer) {
        this.logger.warn(
          `Customer ${customerId} not found for order ${orderId}`,
        );
        return;
      }

      const statusMessages = {
        ACCEPTED: 'تم قبول طلبك',
        IN_PROGRESS: 'طلبك قيد التنفيذ',
        COMPLETED: 'تم إنجاز طلبك',
        CANCELLED: 'تم إلغاء طلبك',
        REJECTED: 'تم رفض طلبك',
      };

      const notificationData: NotificationData = {
        title: `تحديث حالة الطلب`,
        body: `${statusMessages[status] || 'تم تحديث حالة الطلب'} من ${providerName}`,
        imageUrl: providerImage,
        data: {
          type: 'order_status_update',
          orderId: orderId.toString(),
          status,
          providerName,
          action: 'view_order',
        },
      };

      // Send to specific customer via FCM token (if available)
      if (customer.fcm) {
        await this.simpleFCMService.sendToUser(customerId, notificationData);
        this.logger.log(
          `FCM notification sent to customer ${customerId} for order ${orderId}`,
        );
      }

      return { success: true, customerId, orderId, status };
    } catch (error) {
      this.logger.error(
        `Failed to send order status notification: ${error.message}`,
      );
      return { success: false, error: error.message };
    }
  }

  // ===== PAYMENT FLOW NOTIFICATIONS =====

  /**
   * Payment successful - notify both customer and provider
   */
  async notifyPaymentSuccess(
    orderId: number,
    customerId: number,
    providerId: number,
    amount: number,
  ) {
    try {
      const [customer, provider] = await Promise.all([
        this.prisma.user.findUnique({
          where: { id: customerId },
          select: { name: true, fcm: true },
        }),
        this.prisma.provider.findUnique({
          where: { id: providerId },
          select: { name: true, fcm: true },
        }),
      ]);

      // Notify customer
      if (customer?.fcm) {
        const customerNotification: NotificationData = {
          title: '💳 Payment Successful',
          body: `Payment of $${amount} has been processed successfully`,
          data: {
            type: 'payment_success',
            orderId: orderId.toString(),
            amount: amount.toString(),
            action: 'view_order',
          },
        };
        await this.simpleFCMService.sendToUser(
          customerId,
          customerNotification,
        );
      }

      // Notify provider
      if (provider?.fcm) {
        const providerNotification: NotificationData = {
          title: '💰 Payment Received',
          body: `Payment of $${amount} has been received for order #${orderId}`,
          data: {
            type: 'payment_received',
            orderId: orderId.toString(),
            amount: amount.toString(),
            action: 'view_order',
          },
        };
        await this.simpleFCMService.sendToProvider(
          providerId,
          providerNotification,
        );
      }

      // Send general notifications to topics
      await Promise.all([
        this.simplifiedChannelService.sendToUsers(
          '💳 Payment Successful',
          'Your payment has been processed successfully',
          { type: 'payment_success', action: 'view_orders' },
        ),
        this.simplifiedChannelService.sendToProviders(
          '💰 Payment Received',
          'A new payment has been received',
          { type: 'payment_received', action: 'view_orders' },
        ),
      ]);

      return { success: true, orderId, customerId, providerId };
    } catch (error) {
      this.logger.error(
        `Failed to send payment success notification: ${error.message}`,
      );
      return { success: false, error: error.message };
    }
  }

  /**
   * Payment failed - notify customer
   */
  async notifyPaymentFailure(
    orderId: number,
    customerId: number,
    errorMessage: string,
  ) {
    try {
      const customer = await this.prisma.user.findUnique({
        where: { id: customerId },
        select: { name: true, fcm: true },
      });

      if (!customer) return;

      const notificationData: NotificationData = {
        title: '❌ Payment Failed',
        body: `Payment failed: ${errorMessage}. Please try again.`,
        data: {
          type: 'payment_failed',
          orderId: orderId.toString(),
          errorMessage,
          action: 'retry_payment',
        },
      };

      // Send to specific customer
      if (customer.fcm) {
        await this.simpleFCMService.sendToUser(customerId, notificationData);
      }

      // Send to users topic
      await this.simplifiedChannelService.sendToUsers(
        notificationData.title,
        notificationData.body,
        notificationData.data,
      );

      return { success: true, customerId, orderId };
    } catch (error) {
      this.logger.error(
        `Failed to send payment failure notification: ${error.message}`,
      );
      return { success: false, error: error.message };
    }
  }

  // ===== RATING FLOW NOTIFICATIONS =====

  /**
   * New rating received - notify provider
   */
  async notifyNewRating(
    ratingId: number,
    providerId: number,
    customerName: string,
    rating: number,
    comment?: string,
  ) {
    try {
      const provider = await this.prisma.provider.findUnique({
        where: { id: providerId },
        select: { name: true, fcm: true },
      });

      if (!provider) return;

      const stars = '⭐'.repeat(rating);
      const notificationData: NotificationData = {
        title: `${stars} New Rating Received`,
        body: `${customerName} gave you ${rating} stars${comment ? `: "${comment}"` : ''}`,
        data: {
          type: 'new_rating',
          ratingId: ratingId.toString(),
          providerId: providerId.toString(),
          rating: rating.toString(),
          customerName,
          action: 'view_rating',
        },
      };

      // Send to specific provider
      if (provider.fcm) {
        await this.simpleFCMService.sendToProvider(
          providerId,
          notificationData,
        );
      }

      // Send to providers topic
      await this.simplifiedChannelService.sendToProviders(
        notificationData.title,
        notificationData.body,
        notificationData.data,
      );

      return { success: true, providerId, ratingId };
    } catch (error) {
      this.logger.error(
        `Failed to send new rating notification: ${error.message}`,
      );
      return { success: false, error: error.message };
    }
  }

  /**
   * Rating updated - notify provider
   */
  async notifyRatingUpdate(
    ratingId: number,
    providerId: number,
    customerName: string,
    oldRating: number,
    newRating: number,
  ) {
    try {
      const provider = await this.prisma.provider.findUnique({
        where: { id: providerId },
        select: { name: true, fcm: true },
      });

      if (!provider) return;

      const notificationData: NotificationData = {
        title: '🔄 Rating Updated',
        body: `${customerName} updated their rating from ${oldRating} to ${newRating} stars`,
        data: {
          type: 'rating_updated',
          ratingId: ratingId.toString(),
          providerId: providerId.toString(),
          oldRating: oldRating.toString(),
          newRating: newRating.toString(),
          customerName,
          action: 'view_rating',
        },
      };

      if (provider.fcm) {
        await this.simpleFCMService.sendToProvider(
          providerId,
          notificationData,
        );
      }

      return { success: true, providerId, ratingId };
    } catch (error) {
      this.logger.error(
        `Failed to send rating update notification: ${error.message}`,
      );
      return { success: false, error: error.message };
    }
  }

  // ===== SERVICE FLOW NOTIFICATIONS =====

  /**
   * New service added - notify all users
   */
  async notifyNewService(
    serviceId: number,
    serviceName: string,
    providerName: string,
    category: string,
  ) {
    try {
      const notificationData: NotificationData = {
        title: '🆕 New Service Available',
        body: `${providerName} added "${serviceName}" in ${category}`,
        data: {
          type: 'new_service',
          serviceId: serviceId.toString(),
          serviceName,
          providerName,
          category,
          action: 'view_service',
        },
      };

      // Send to all users via topic
      await this.simplifiedChannelService.sendToUsers(
        notificationData.title,
        notificationData.body,
        notificationData.data,
      );

      // Send to all providers via topic
      await this.simplifiedChannelService.sendToProviders(
        '🆕 New Service Added',
        `A new service "${serviceName}" has been added to the platform`,
        { type: 'new_service', action: 'view_services' },
      );

      return { success: true, serviceId, serviceName };
    } catch (error) {
      this.logger.error(
        `Failed to send new service notification: ${error.message}`,
      );
      return { success: false, error: error.message };
    }
  }

  /**
   * Service updated - notify interested users
   */
  async notifyServiceUpdate(
    serviceId: number,
    serviceName: string,
    providerName: string,
    changes: string[],
  ) {
    try {
      const notificationData: NotificationData = {
        title: '🔄 Service Updated',
        body: `${serviceName} by ${providerName} has been updated`,
        data: {
          type: 'service_updated',
          serviceId: serviceId.toString(),
          serviceName,
          providerName,
          changes: changes.join(', '),
          action: 'view_service',
        },
      };

      // Send to users topic
      await this.simplifiedChannelService.sendToUsers(
        notificationData.title,
        notificationData.body,
        notificationData.data,
      );

      return { success: true, serviceId, serviceName };
    } catch (error) {
      this.logger.error(
        `Failed to send service update notification: ${error.message}`,
      );
      return { success: false, error: error.message };
    }
  }

  // ===== OFFER FLOW NOTIFICATIONS =====

  /**
   * New offer created - notify relevant users
   */
  async notifyNewOffer(
    offerId: number,
    offerTitle: string,
    providerName: string,
    discount: string,
    serviceName: string,
  ) {
    try {
      const notificationData: NotificationData = {
        title: '🎉 Special Offer Available',
        body: `${providerName} is offering ${discount} off on ${serviceName}`,
        data: {
          type: 'new_offer',
          offerId: offerId.toString(),
          offerTitle,
          providerName,
          discount,
          serviceName,
          action: 'view_offer',
        },
      };

      // Send to all users via topic
      await this.simplifiedChannelService.sendToUsers(
        notificationData.title,
        notificationData.body,
        notificationData.data,
      );

      // Send to all providers via topic
      await this.simplifiedChannelService.sendToProviders(
        '🎉 New Offer Created',
        `A new offer "${offerTitle}" has been created`,
        { type: 'new_offer', action: 'view_offers' },
      );

      return { success: true, offerId, offerTitle };
    } catch (error) {
      this.logger.error(
        `Failed to send new offer notification: ${error.message}`,
      );
      return { success: false, error: error.message };
    }
  }

  /**
   * Offer expired - notify users who might be interested
   */
  async notifyOfferExpired(
    offerId: number,
    offerTitle: string,
    providerName: string,
  ) {
    try {
      const notificationData: NotificationData = {
        title: '⏰ Offer Expired',
        body: `The offer "${offerTitle}" by ${providerName} has expired`,
        data: {
          type: 'offer_expired',
          offerId: offerId.toString(),
          offerTitle,
          providerName,
          action: 'view_expired_offers',
        },
      };

      // Send to users topic
      await this.simplifiedChannelService.sendToUsers(
        notificationData.title,
        notificationData.body,
        notificationData.data,
      );

      return { success: true, offerId, offerTitle };
    } catch (error) {
      this.logger.error(
        `Failed to send offer expired notification: ${error.message}`,
      );
      return { success: false, error: error.message };
    }
  }

  // ===== SYSTEM NOTIFICATIONS =====

  /**
   * System maintenance notification
   */
  async notifySystemMaintenance(
    message: string,
    scheduledTime?: string,
    duration?: string,
  ) {
    try {
      const notificationData: NotificationData = {
        title: '🔧 System Maintenance',
        body: message,
        data: {
          type: 'system_maintenance',
          scheduledTime: scheduledTime || '',
          duration: duration || '',
          action: 'view_notice',
        },
      };

      // Send to all users and providers
      await Promise.all([
        this.simplifiedChannelService.sendToUsers(
          notificationData.title,
          notificationData.body,
          notificationData.data,
        ),
        this.simplifiedChannelService.sendToProviders(
          notificationData.title,
          notificationData.body,
          notificationData.data,
        ),
      ]);

      return { success: true, message };
    } catch (error) {
      this.logger.error(
        `Failed to send system maintenance notification: ${error.message}`,
      );
      return { success: false, error: error.message };
    }
  }

  /**
   * General announcement to all users
   */
  async sendGeneralAnnouncement(
    title: string,
    message: string,
    targetAudience: 'users' | 'providers' | 'all' = 'all',
  ) {
    try {
      const notificationData: NotificationData = {
        title,
        body: message,
        data: {
          type: 'general_announcement',
          timestamp: new Date().toISOString(),
          action: 'view_announcement',
        },
      };

      if (targetAudience === 'users' || targetAudience === 'all') {
        await this.simplifiedChannelService.sendToUsers(
          notificationData.title,
          notificationData.body,
          notificationData.data,
        );
      }

      if (targetAudience === 'providers' || targetAudience === 'all') {
        await this.simplifiedChannelService.sendToProviders(
          notificationData.title,
          notificationData.body,
          notificationData.data,
        );
      }

      return { success: true, targetAudience, title, message };
    } catch (error) {
      this.logger.error(
        `Failed to send general announcement: ${error.message}`,
      );
      return { success: false, error: error.message };
    }
  }
}

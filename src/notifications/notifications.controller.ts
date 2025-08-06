import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    Query,
    UseGuards,
    ParseIntPipe,
    HttpStatus,
    HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateFcmTokenDto } from './dto/update-fcm-token.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new notification' })
    @ApiResponse({ status: 201, description: 'Notification created successfully' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
    async createNotification(@Body() createNotificationDto: CreateNotificationDto) {
        return this.notificationsService.createNotification(createNotificationDto);
    }

    @Post(':id/send')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Send a notification to target audience' })
    @ApiResponse({ status: 200, description: 'Notification sent successfully' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
    @ApiResponse({ status: 404, description: 'Notification not found' })
    async sendNotification(@Param('id', ParseIntPipe) id: number) {
        return this.notificationsService.sendNotification(id);
    }

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all notifications with pagination' })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10)' })
    @ApiResponse({ status: 200, description: 'Notifications retrieved successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
    async getAllNotifications(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
    ) {
        return this.notificationsService.getAllNotifications(page, limit);
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get notification by ID' })
    @ApiResponse({ status: 200, description: 'Notification retrieved successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
    @ApiResponse({ status: 404, description: 'Notification not found' })
    async getNotificationById(@Param('id', ParseIntPipe) id: number) {
        return this.notificationsService.getNotificationById(id);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete a notification' })
    @ApiResponse({ status: 200, description: 'Notification deleted successfully' })
    @ApiResponse({ status: 400, description: 'Bad request - Cannot delete sent notification' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
    @ApiResponse({ status: 404, description: 'Notification not found' })
    async deleteNotification(@Param('id', ParseIntPipe) id: number) {
        return this.notificationsService.deleteNotification(id);
    }

    // FCM Token Management for Users
    @Post('users/:userId/fcm-token')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update FCM token for a user' })
    @ApiResponse({ status: 200, description: 'FCM token updated successfully' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'User not found' })
    async updateUserFcmToken(
        @Param('userId', ParseIntPipe) userId: number,
        @Body() updateFcmTokenDto: UpdateFcmTokenDto,
    ) {
        return this.notificationsService.updateUserFcmToken(userId, updateFcmTokenDto.fcmToken);
    }

    // FCM Token Management for Providers
    @Post('providers/:providerId/fcm-token')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update FCM token for a provider' })
    @ApiResponse({ status: 200, description: 'FCM token updated successfully' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Provider not found' })
    async updateProviderFcmToken(
        @Param('providerId', ParseIntPipe) providerId: number,
        @Body() updateFcmTokenDto: UpdateFcmTokenDto,
    ) {
        return this.notificationsService.updateProviderFcmToken(providerId, updateFcmTokenDto.fcmToken);
    }

    // Order-specific notifications
    @Post('orders/:orderId')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Send order-specific notification' })
    @ApiResponse({ status: 200, description: 'Order notification sent successfully' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
    @ApiResponse({ status: 404, description: 'Order not found' })
    async sendOrderNotification(
        @Param('orderId', ParseIntPipe) orderId: number,
        @Body() body: { title: string; message: string; data?: Record<string, any> },
    ) {
        return this.notificationsService.sendOrderNotification(
            orderId,
            body.title,
            body.message,
            body.data,
        );
    }

    // Offer-specific notifications
    @Post('offers/:offerId')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Send offer-specific notification' })
    @ApiResponse({ status: 200, description: 'Offer notification sent successfully' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
    @ApiResponse({ status: 404, description: 'Offer not found' })
    async sendOfferNotification(
        @Param('offerId', ParseIntPipe) offerId: number,
        @Body() body: { title: string; message: string; data?: Record<string, any> },
    ) {
        return this.notificationsService.sendOfferNotification(
            offerId,
            body.title,
            body.message,
            body.data,
        );
    }
} 
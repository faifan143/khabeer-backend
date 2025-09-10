import {
    Controller,
    Post,
    Body,
    Param,
    ParseIntPipe,
    UseGuards,
    Get,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ComprehensiveAuthGuard } from '../auth/comprehensive-auth.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { SimpleFCMService, FCMNotificationPayload } from './simple-fcm.service';

@ApiTags('fcm-test')
@Controller('fcm-test')
// @UseGuards(JwtAuthGuard, ComprehensiveAuthGuard)
// @Roles('ADMIN')
// @ApiBearerAuth()
export class FCMTestController {
    constructor(
        private readonly simpleFCMService: SimpleFCMService,
    ) { }

    @Post('send-to-user/:userId')
    @ApiOperation({ summary: 'Send test notification to specific user' })
    @ApiResponse({ status: 200, description: 'Test notification sent to user' })
    async sendToUser(
        @Param('userId', ParseIntPipe) userId: number,
        @Body() body: { title?: string; body?: string; data?: Record<string, string>; imageUrl?: string }
    ) {
        const payload: FCMNotificationPayload = {
            title: body.title || '🧪 Test Notification',
            body: body.body || `Testing FCM for user ${userId} at ${new Date().toLocaleTimeString()}`,
            data: {
                test: 'true',
                timestamp: new Date().toISOString(),
                userId: userId.toString(),
                ...body.data
            },
            imageUrl: body.imageUrl
        };

        const result = await this.simpleFCMService.sendToUser(userId, payload);

        return {
            message: `Test notification sent to user ${userId}`,
            userId,
            success: result.success,
            messageId: result.messageId,
            error: result.error,
            payload,
            timestamp: new Date().toISOString()
        };
    }

    @Post('send-to-provider/:providerId')
    @ApiOperation({ summary: 'Send test notification to specific provider' })
    @ApiResponse({ status: 200, description: 'Test notification sent to provider' })
    async sendToProvider(
        @Param('providerId', ParseIntPipe) providerId: number,
        @Body() body: { title?: string; body?: string; data?: Record<string, string>; imageUrl?: string }
    ) {
        const payload: FCMNotificationPayload = {
            title: body.title || '🧪 Test Notification',
            body: body.body || `Testing FCM for provider ${providerId} at ${new Date().toLocaleTimeString()}`,
            data: {
                test: 'true',
                timestamp: new Date().toISOString(),
                providerId: providerId.toString(),
                ...body.data
            },
            imageUrl: body.imageUrl
        };

        const result = await this.simpleFCMService.sendToProvider(providerId, payload);

        return {
            message: `Test notification sent to provider ${providerId}`,
            providerId,
            success: result.success,
            messageId: result.messageId,
            error: result.error,
            payload,
            timestamp: new Date().toISOString()
        };
    }

    @Post('send-to-all-users')
    @ApiOperation({ summary: 'Send test notification to all users' })
    @ApiResponse({ status: 200, description: 'Test notifications sent to all users' })
    async sendToAllUsers(
        @Body() body: { title?: string; body?: string; data?: Record<string, string>; imageUrl?: string }
    ) {
        const payload: FCMNotificationPayload = {
            title: body.title || '🧪 Test Notification - All Users',
            body: body.body || `Testing FCM for all users at ${new Date().toLocaleTimeString()}`,
            data: {
                test: 'true',
                timestamp: new Date().toISOString(),
                ...body.data
            },
            imageUrl: body.imageUrl
        };

        const result = await this.simpleFCMService.sendToAllUsers(payload);

        return {
            message: 'Test notifications sent to all users',
            success: result.success,
            sentCount: result.sentCount,
            totalCount: result.totalCount,
            payload,
            timestamp: new Date().toISOString()
        };
    }

    @Post('send-to-all-providers')
    @ApiOperation({ summary: 'Send test notification to all providers' })
    @ApiResponse({ status: 200, description: 'Test notifications sent to all providers' })
    async sendToAllProviders(
        @Body() body: { title?: string; body?: string; data?: Record<string, string>; imageUrl?: string }
    ) {
        const payload: FCMNotificationPayload = {
            title: body.title || '🧪 Test Notification - All Providers',
            body: body.body || `Testing FCM for all providers at ${new Date().toLocaleTimeString()}`,
            data: {
                test: 'true',
                timestamp: new Date().toISOString(),
                ...body.data
            },
            imageUrl: body.imageUrl
        };

        const result = await this.simpleFCMService.sendToAllProviders(payload);

        return {
            message: 'Test notifications sent to all providers',
            success: result.success,
            sentCount: result.sentCount,
            totalCount: result.totalCount,
            payload,
            timestamp: new Date().toISOString()
        };
    }

    @Post('send-to-token')
    @ApiOperation({ summary: 'Send test notification to custom FCM token' })
    @ApiResponse({ status: 200, description: 'Test notification sent to custom token' })
    async sendToCustomToken(
        @Body() body: {
            fcmToken: string;
            title?: string;
            body?: string;
            data?: Record<string, string>;
            imageUrl?: string
        }
    ) {
        if (!body.fcmToken) {
            return {
                success: false,
                error: 'FCM token is required',
                timestamp: new Date().toISOString()
            };
        }

        const payload: FCMNotificationPayload = {
            title: body.title || '🧪 Test Notification - Custom Token',
            body: body.body || `Testing FCM with custom token at ${new Date().toLocaleTimeString()}`,
            data: {
                test: 'true',
                timestamp: new Date().toISOString(),
                tokenType: 'custom',
                ...body.data
            },
            imageUrl: body.imageUrl,
            type: "call"
        };

        try {
            // Import Firebase Admin SDK
            const admin = require('firebase-admin');

            if (!admin.apps.length) {
                return {
                    success: false,
                    error: 'Firebase Admin SDK not initialized',
                    timestamp: new Date().toISOString()
                };
            }

            const message = {
                token: body.fcmToken,
                data: payload.data,
            };

            const response = await admin.app().messaging().send(message);

            return {
                message: 'Test notification sent to custom FCM token',
                success: true,
                messageId: response,
                fcmToken: body.fcmToken.substring(0, 20) + '...', // Show partial token for security
                payload,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                message: 'Failed to send notification to custom FCM token',
                success: false,
                error: error.message,
                fcmToken: body.fcmToken.substring(0, 20) + '...',
                payload,
                timestamp: new Date().toISOString()
            };
        }
    }

    @Get('status')
    @ApiOperation({ summary: 'Get FCM service status' })
    @ApiResponse({ status: 200, description: 'FCM service status retrieved' })
    async getStatus() {
        return {
            message: 'FCM Test Service Status',
            status: 'operational',
            timestamp: new Date().toISOString(),
            availableEndpoints: [
                'POST /fcm-test/send-to-user/:userId',
                'POST /fcm-test/send-to-provider/:providerId',
                'POST /fcm-test/send-to-all-users',
                'POST /fcm-test/send-to-all-providers',
                'POST /fcm-test/send-to-token',
                'GET /fcm-test/status'
            ]
        };
    }
}

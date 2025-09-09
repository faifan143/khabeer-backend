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
import { FCMService } from './fcm.service';
import { SimpleFCMService } from './simple-fcm.service';
import { SimplifiedChannelService } from './simplified-channel.service';

@ApiTags('notification-testing')
@Controller('notification-test')
@UseGuards(JwtAuthGuard, ComprehensiveAuthGuard)
@Roles('ADMIN')
@ApiBearerAuth()
export class NotificationTestController {
    constructor(
        private readonly fcmService: FCMService,
        private readonly simpleFCMService: SimpleFCMService,
        private readonly simplifiedChannelService: SimplifiedChannelService,
    ) { }

    // ===== TOPIC-BASED TESTING =====

    @Post('topics/test-all')
    @ApiOperation({ summary: 'Test all FCM topics with sample messages' })
    @ApiResponse({ status: 200, description: 'Test messages sent to all topics' })
    async testAllTopics() {
        try {
            const topics = ['channel_users', 'channel_providers'];
            const results: any[] = [];

            for (const topic of topics) {
                const result = await this.fcmService.sendToTopic(topic, {
                    title: '🧪 Topic Test Message',
                    body: `Testing topic: ${topic} - ${new Date().toLocaleTimeString()}`,
                    data: {
                        test: 'true',
                        timestamp: new Date().toISOString(),
                        topic: topic,
                        type: 'topic_test'
                    }
                });

                results.push({
                    topic,
                    success: result.success,
                    messageId: result.messageId,
                    error: result.error,
                    timestamp: new Date().toISOString()
                });
            }

            return {
                message: '🧪 Test messages sent to all topics',
                totalTopics: topics.length,
                results,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            throw new Error(`Failed to send test messages: ${error.message}`);
        }
    }

    @Post('topics/test/:topic')
    @ApiOperation({ summary: 'Test specific FCM topic' })
    @ApiResponse({ status: 200, description: 'Test message sent to specific topic' })
    async testSpecificTopic(
        @Param('topic') topic: string,
        @Body() body: { title?: string; body?: string; data?: Record<string, string> }
    ) {
        const payload = {
            title: body.title || `🧪 Test: ${topic}`,
            body: body.body || `Testing topic ${topic} at ${new Date().toLocaleTimeString()}`,
            data: {
                test: 'true',
                timestamp: new Date().toISOString(),
                topic: topic,
                type: 'topic_test',
                ...body.data
            }
        };

        const result = await this.fcmService.sendToTopic(topic, payload);

        return {
            message: `🧪 Test message sent to topic: ${topic}`,
            topic,
            success: result.success,
            messageId: result.messageId,
            error: result.error,
            payload,
            timestamp: new Date().toISOString()
        };
    }

    @Get('topics/info')
    @ApiOperation({ summary: 'Get information about all available topics' })
    @ApiResponse({ status: 200, description: 'Topic information retrieved' })
    async getTopicsInfo() {
        const topics = this.fcmService.getAllTopics();
        const topicInfo = await Promise.all(
            topics.map(async (topic) => {
                const info = await this.fcmService.getTopicInfo(topic);
                return {
                    topicName: topic,
                    ...info
                };
            })
        );

        return {
            message: '📊 Available FCM Topics Information',
            totalTopics: topics.length,
            topics: topicInfo,
            timestamp: new Date().toISOString()
        };
    }

    // ===== TOKEN-BASED TESTING =====

    @Post('tokens/test-user/:userId')
    @ApiOperation({ summary: 'Test FCM token notification to specific user' })
    @ApiResponse({ status: 200, description: 'Test notification sent to user' })
    async testUserToken(
        @Param('userId', ParseIntPipe) userId: number,
        @Body() body: { title?: string; body?: string; data?: Record<string, string>; imageUrl?: string }
    ) {
        const payload = {
            title: body.title || '🧪 User Test Notification',
            body: body.body || `Testing FCM token for user ${userId} at ${new Date().toLocaleTimeString()}`,
            data: {
                test: 'true',
                timestamp: new Date().toISOString(),
                userId: userId.toString(),
                type: 'user_token_test',
                ...body.data
            },
            imageUrl: body.imageUrl
        };

        const result = await this.simpleFCMService.sendToUser(userId, payload);

        return {
            message: `🧪 Test notification sent to user ${userId}`,
            userId,
            success: result.success,
            messageId: result.messageId,
            error: result.error,
            payload,
            timestamp: new Date().toISOString()
        };
    }

    @Post('tokens/test-provider/:providerId')
    @ApiOperation({ summary: 'Test FCM token notification to specific provider' })
    @ApiResponse({ status: 200, description: 'Test notification sent to provider' })
    async testProviderToken(
        @Param('providerId', ParseIntPipe) providerId: number,
        @Body() body: { title?: string; body?: string; data?: Record<string, string>; imageUrl?: string }
    ) {
        const payload = {
            title: body.title || '🧪 Provider Test Notification',
            body: body.body || `Testing FCM token for provider ${providerId} at ${new Date().toLocaleTimeString()}`,
            data: {
                test: 'true',
                timestamp: new Date().toISOString(),
                providerId: providerId.toString(),
                type: 'provider_token_test',
                ...body.data
            },
            imageUrl: body.imageUrl
        };

        const result = await this.simpleFCMService.sendToProvider(providerId, payload);

        return {
            message: `🧪 Test notification sent to provider ${providerId}`,
            providerId,
            success: result.success,
            messageId: result.messageId,
            error: result.error,
            payload,
            timestamp: new Date().toISOString()
        };
    }

    @Post('tokens/test-all-users')
    @ApiOperation({ summary: 'Test FCM token notifications to all users' })
    @ApiResponse({ status: 200, description: 'Test notifications sent to all users' })
    async testAllUsersTokens(
        @Body() body: { title?: string; body?: string; data?: Record<string, string>; imageUrl?: string }
    ) {
        const payload = {
            title: body.title || '🧪 All Users Test Notification',
            body: body.body || `Testing FCM tokens for all users at ${new Date().toLocaleTimeString()}`,
            data: {
                test: 'true',
                timestamp: new Date().toISOString(),
                type: 'all_users_token_test',
                ...body.data
            },
            imageUrl: body.imageUrl
        };

        const result = await this.simpleFCMService.sendToAllUsers(payload);

        return {
            message: '🧪 Test notifications sent to all users with FCM tokens',
            success: result.success,
            sentCount: result.sentCount,
            totalCount: result.totalCount,
            payload,
            timestamp: new Date().toISOString()
        };
    }

    @Post('tokens/test-all-providers')
    @ApiOperation({ summary: 'Test FCM token notifications to all providers' })
    @ApiResponse({ status: 200, description: 'Test notifications sent to all providers' })
    async testAllProvidersTokens(
        @Body() body: { title?: string; body?: string; data?: Record<string, string>; imageUrl?: string }
    ) {
        const payload = {
            title: body.title || '🧪 All Providers Test Notification',
            body: body.body || `Testing FCM tokens for all providers at ${new Date().toLocaleTimeString()}`,
            data: {
                test: 'true',
                timestamp: new Date().toISOString(),
                type: 'all_providers_token_test',
                ...body.data
            },
            imageUrl: body.imageUrl
        };

        const result = await this.simpleFCMService.sendToAllProviders(payload);

        return {
            message: '🧪 Test notifications sent to all providers with FCM tokens',
            success: result.success,
            sentCount: result.sentCount,
            totalCount: result.totalCount,
            payload,
            timestamp: new Date().toISOString()
        };
    }

    // ===== COMPARISON TESTING =====

    @Post('compare/topic-vs-token')
    @ApiOperation({ summary: 'Compare topic-based vs token-based messaging for the same audience' })
    @ApiResponse({ status: 200, description: 'Comparison test completed' })
    async compareTopicVsToken(
        @Body() body: {
            title?: string;
            body?: string;
            data?: Record<string, string>;
            imageUrl?: string;
            targetAudience: 'users' | 'providers' | 'both';
        }
    ) {
        const payload = {
            title: body.title || '🔄 Comparison Test',
            body: body.body || `Testing topic vs token messaging at ${new Date().toLocaleTimeString()}`,
            data: {
                test: 'true',
                timestamp: new Date().toISOString(),
                type: 'comparison_test',
                ...body.data
            },
            imageUrl: body.imageUrl
        };

        const results: any = {
            message: '🔄 Topic vs Token messaging comparison test',
            targetAudience: body.targetAudience,
            timestamp: new Date().toISOString(),
            topicResults: {},
            tokenResults: {}
        };

        // Test topic-based messaging
        if (body.targetAudience === 'users' || body.targetAudience === 'both') {
            const topicResult = await this.simplifiedChannelService.sendToUsers(
                payload.title,
                payload.body,
                payload.data,
                payload.imageUrl
            );
            results.topicResults.users = {
                success: topicResult,
                method: 'topic-based',
                topic: 'channel_users'
            };
        }

        if (body.targetAudience === 'providers' || body.targetAudience === 'both') {
            const topicResult = await this.simplifiedChannelService.sendToProviders(
                payload.title,
                payload.body,
                payload.data,
                payload.imageUrl
            );
            results.topicResults.providers = {
                success: topicResult,
                method: 'topic-based',
                topic: 'channel_providers'
            };
        }

        // Test token-based messaging
        if (body.targetAudience === 'users' || body.targetAudience === 'both') {
            const tokenResult = await this.simpleFCMService.sendToAllUsers(payload);
            results.tokenResults.users = {
                success: tokenResult.success,
                sentCount: tokenResult.sentCount,
                totalCount: tokenResult.totalCount,
                method: 'token-based'
            };
        }

        if (body.targetAudience === 'providers' || body.targetAudience === 'both') {
            const tokenResult = await this.simpleFCMService.sendToAllProviders(payload);
            results.tokenResults.providers = {
                success: tokenResult.success,
                sentCount: tokenResult.sentCount,
                totalCount: tokenResult.totalCount,
                method: 'token-based'
            };
        }

        return results;
    }

    // ===== SYSTEM STATUS =====

    @Get('status')
    @ApiOperation({ summary: 'Get FCM system status and statistics' })
    @ApiResponse({ status: 200, description: 'System status retrieved' })
    async getSystemStatus() {
        const topics = this.fcmService.getAllTopics();

        // Get topic info
        const topicInfo = await Promise.all(
            topics.map(async (topic) => {
                const info = await this.fcmService.getTopicInfo(topic);
                return { topicName: topic, ...info };
            })
        );

        // Log topic stats
        await this.fcmService.logTopicStats();

        return {
            message: '📊 FCM System Status',
            status: 'operational',
            firebaseInitialized: true,
            availableTopics: topicInfo,
            totalTopics: topics.length,
            timestamp: new Date().toISOString(),
            services: {
                fcmService: 'active',
                simpleFCMService: 'active',
                simplifiedChannelService: 'active'
            }
        };
    }
}

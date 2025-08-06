import {
    Controller,
    Post,
    Body,
    Param,
    Get,
    UseGuards,
    ParseIntPipe,
    HttpStatus,
    HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ChannelService } from './channel.service';
import { ChannelInitService } from './channel-init.service';
import {
    SubscribeToChannelDto,
    UnsubscribeFromChannelDto,
    BulkSubscriptionDto,
    ChannelType
} from './dto/channel.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('channels')
@Controller('channels')
export class ChannelController {
    constructor(
        private readonly channelService: ChannelService,
        private readonly channelInitService: ChannelInitService,
    ) { }

    // User subscription endpoints
    @Post('users/:userId/subscribe')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Subscribe a user to a channel' })
    @ApiResponse({ status: 200, description: 'User subscribed successfully' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async subscribeUserToChannel(
        @Param('userId', ParseIntPipe) userId: number,
        @Body() subscribeDto: SubscribeToChannelDto,
    ) {
        const success = await this.channelService.subscribeUserToChannel(userId, subscribeDto.channel);
        return {
            success,
            message: success ? 'User subscribed to channel successfully' : 'Failed to subscribe user to channel',
        };
    }

    @Post('users/:userId/unsubscribe')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Unsubscribe a user from a channel' })
    @ApiResponse({ status: 200, description: 'User unsubscribed successfully' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async unsubscribeUserFromChannel(
        @Param('userId', ParseIntPipe) userId: number,
        @Body() unsubscribeDto: UnsubscribeFromChannelDto,
    ) {
        const success = await this.channelService.unsubscribeUserFromChannel(userId, unsubscribeDto.channel);
        return {
            success,
            message: success ? 'User unsubscribed from channel successfully' : 'Failed to unsubscribe user from channel',
        };
    }

    // Provider subscription endpoints
    @Post('providers/:providerId/subscribe')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Subscribe a provider to a channel' })
    @ApiResponse({ status: 200, description: 'Provider subscribed successfully' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async subscribeProviderToChannel(
        @Param('providerId', ParseIntPipe) providerId: number,
        @Body() subscribeDto: SubscribeToChannelDto,
    ) {
        const success = await this.channelService.subscribeProviderToChannel(providerId, subscribeDto.channel);
        return {
            success,
            message: success ? 'Provider subscribed to channel successfully' : 'Failed to subscribe provider to channel',
        };
    }

    @Post('providers/:providerId/unsubscribe')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Unsubscribe a provider from a channel' })
    @ApiResponse({ status: 200, description: 'Provider unsubscribed successfully' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async unsubscribeProviderFromChannel(
        @Param('providerId', ParseIntPipe) providerId: number,
        @Body() unsubscribeDto: UnsubscribeFromChannelDto,
    ) {
        const success = await this.channelService.unsubscribeProviderFromChannel(providerId, unsubscribeDto.channel);
        return {
            success,
            message: success ? 'Provider unsubscribed from channel successfully' : 'Failed to unsubscribe provider from channel',
        };
    }

    // Bulk subscription endpoints (Admin only)
    @Post('bulk-subscription')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Bulk subscribe/unsubscribe FCM tokens to/from a channel' })
    @ApiResponse({ status: 200, description: 'Bulk subscription action completed' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
    async bulkSubscriptionAction(@Body() bulkSubscriptionDto: BulkSubscriptionDto) {
        const success = await this.channelService.bulkSubscriptionAction(
            bulkSubscriptionDto.fcmTokens,
            bulkSubscriptionDto.channel,
            bulkSubscriptionDto.action
        );
        return {
            success,
            message: success ? 'Bulk subscription action completed successfully' : 'Failed to complete bulk subscription action',
        };
    }

    // Subscribe all users/providers to channels (Admin only)
    @Post('subscribe-all-users/:channel')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Subscribe all users to a channel' })
    @ApiResponse({ status: 200, description: 'All users subscribed successfully' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
    async subscribeAllUsersToChannel(@Param('channel') channel: ChannelType) {
        const result = await this.channelService.subscribeAllUsersToChannel(channel);
        return {
            success: result.success,
            count: result.count,
            message: result.success
                ? `Successfully subscribed ${result.count} users to channel ${channel}`
                : 'Failed to subscribe users to channel',
        };
    }

    @Post('subscribe-all-providers/:channel')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Subscribe all providers to a channel' })
    @ApiResponse({ status: 200, description: 'All providers subscribed successfully' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
    async subscribeAllProvidersToChannel(@Param('channel') channel: ChannelType) {
        const result = await this.channelService.subscribeAllProvidersToChannel(channel);
        return {
            success: result.success,
            count: result.count,
            message: result.success
                ? `Successfully subscribed ${result.count} providers to channel ${channel}`
                : 'Failed to subscribe providers to channel',
        };
    }

    // Send notification to channel (Admin only)
    @Post(':channel/send')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Send notification to a specific channel' })
    @ApiResponse({ status: 200, description: 'Notification sent to channel successfully' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
    async sendNotificationToChannel(
        @Param('channel') channel: ChannelType,
        @Body() body: { title: string; message: string; imageUrl?: string; data?: Record<string, string> },
    ) {
        const success = await this.channelService.sendNotificationToChannel(
            channel,
            body.title,
            body.message,
            body.imageUrl,
            body.data
        );
        return {
            success,
            message: success ? 'Notification sent to channel successfully' : 'Failed to send notification to channel',
        };
    }

    // Get channel statistics (Admin only)
    @Get('statistics')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get channel statistics' })
    @ApiResponse({ status: 200, description: 'Channel statistics retrieved successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
    async getChannelStatistics() {
        const statistics = await this.channelService.getChannelStatistics();
        return {
            success: true,
            statistics,
        };
    }

    // Reinitialize channels (Admin only)
    @Post('reinitialize')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Reinitialize channel subscriptions for all users and providers' })
    @ApiResponse({ status: 200, description: 'Channel subscriptions reinitialized successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
    async reinitializeChannels() {
        return await this.channelInitService.reinitializeChannels();
    }

    // Health check endpoint
    @Get('health')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Channel service health check' })
    @ApiResponse({ status: 200, description: 'Channel service is healthy' })
    async healthCheck() {
        return {
            status: 'healthy',
            service: 'channel-service',
            timestamp: new Date().toISOString(),
        };
    }
} 
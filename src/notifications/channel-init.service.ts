import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ChannelService } from './channel.service';
import { ChannelType } from './dto/channel.dto';

@Injectable()
export class ChannelInitService implements OnModuleInit {
    private readonly logger = new Logger(ChannelInitService.name);

    constructor(
        private prisma: PrismaService,
        private channelService: ChannelService,
    ) { }

    async onModuleInit() {
        this.logger.log('Initializing channel subscriptions...');
        await this.initializeChannelSubscriptions();
    }

    /**
     * Initialize channel subscriptions for existing users and providers
     */
    private async initializeChannelSubscriptions() {
        try {
            // Subscribe all existing users to the users channel
            const usersResult = await this.channelService.subscribeAllUsersToChannel(ChannelType.USERS);
            this.logger.log(`Channel initialization - Users: ${usersResult.count} subscribed to users channel`);

            // Subscribe all existing providers to the providers channel
            const providersResult = await this.channelService.subscribeAllProvidersToChannel(ChannelType.PROVIDERS);
            this.logger.log(`Channel initialization - Providers: ${providersResult.count} subscribed to providers channel`);

            // Subscribe all users and providers to the all channel
            const allUsersResult = await this.channelService.subscribeAllUsersToChannel(ChannelType.ALL);
            const allProvidersResult = await this.channelService.subscribeAllProvidersToChannel(ChannelType.ALL);
            this.logger.log(`Channel initialization - All channel: ${allUsersResult.count + allProvidersResult.count} total subscribers`);

            this.logger.log('Channel subscriptions initialized successfully');
        } catch (error) {
            this.logger.error('Failed to initialize channel subscriptions:', error);
        }
    }

    /**
     * Manually trigger channel initialization (for admin use)
     */
    async reinitializeChannels() {
        this.logger.log('Manually reinitializing channel subscriptions...');
        await this.initializeChannelSubscriptions();
        return { success: true, message: 'Channel subscriptions reinitialized' };
    }
} 
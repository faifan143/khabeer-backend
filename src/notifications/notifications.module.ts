import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NotificationsController } from './notifications.controller';
import { ChannelController } from './channel.controller';
import { NotificationsService } from './notifications.service';
import { ChannelService } from './channel.service';
import { ChannelInitService } from './channel-init.service';
import { FCMService } from './fcm.service';
import { NotificationIntegrationService } from './notification-integration.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [ConfigModule, PrismaModule],
    controllers: [NotificationsController, ChannelController],
    providers: [NotificationsService, ChannelService, ChannelInitService, FCMService, NotificationIntegrationService],
    exports: [NotificationsService, ChannelService, FCMService, NotificationIntegrationService],
})
export class NotificationsModule { } 
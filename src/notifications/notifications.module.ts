import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { SimplifiedChannelService } from './simplified-channel.service';
import { FCMService } from './fcm.service';
import { NotificationIntegrationService } from './notification-integration.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [ConfigModule, PrismaModule],
    controllers: [NotificationsController],
    providers: [NotificationsService, SimplifiedChannelService, FCMService, NotificationIntegrationService],
    exports: [NotificationsService, SimplifiedChannelService, FCMService, NotificationIntegrationService],
})
export class NotificationsModule { } 
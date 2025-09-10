import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NotificationsController } from './notifications.controller';
import { NotificationTestController } from './notification-test.controller';
import { FCMTestController } from './fcm-test.controller';
import { NotificationsService } from './notifications.service';
import { SimplifiedChannelService } from './simplified-channel.service';
import { FCMService } from './fcm.service';
import { SimpleFCMService } from './simple-fcm.service';
import { BusinessFlowNotificationsService } from './business-flow-notifications.service';
import { NotificationIntegrationService } from './notification-integration.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [ConfigModule, PrismaModule],
    controllers: [NotificationsController, NotificationTestController, FCMTestController],
    providers: [NotificationsService, SimplifiedChannelService, FCMService, SimpleFCMService, BusinessFlowNotificationsService, NotificationIntegrationService],
    exports: [NotificationsService, SimplifiedChannelService, FCMService, SimpleFCMService, BusinessFlowNotificationsService, NotificationIntegrationService],
})
export class NotificationsModule { } 
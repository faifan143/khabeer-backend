import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { ServicesModule } from '../services/services.module';

@Module({
  imports: [NotificationsModule, ServicesModule],
  controllers: [OrdersController],
  providers: [OrdersService]
})
export class OrdersModule { }

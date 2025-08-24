import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdBannerController } from './ad-banner.controller';
import { AdminService } from './admin.service';
import { PrismaModule } from '../prisma/prisma.module';
import { FilesModule } from '../files/files.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
    imports: [PrismaModule, FilesModule, NotificationsModule],
    controllers: [AdminController, AdBannerController],
    providers: [AdminService],
    exports: [AdminService]
})
export class AdminModule { } 
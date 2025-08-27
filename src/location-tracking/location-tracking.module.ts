import { Module } from '@nestjs/common';
import { LocationTrackingGateway } from './location-tracking.gateway';
import { LocationTrackingService } from './location-tracking.service';
import { LocationTrackingController } from './location-tracking.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module'; // 🔥 CRITICAL FIX: Import AuthModule

@Module({
  imports: [
    PrismaModule,
    AuthModule, // 🔥 CRITICAL FIX: Import AuthModule to get JwtModule
  ],
  controllers: [LocationTrackingController],
  providers: [LocationTrackingGateway, LocationTrackingService],
  exports: [LocationTrackingService],
})
export class LocationTrackingModule { } 
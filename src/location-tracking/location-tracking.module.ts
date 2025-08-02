import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { LocationTrackingGateway } from './location-tracking.gateway';
import { LocationTrackingService } from './location-tracking.service';
import { LocationTrackingController } from './location-tracking.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [LocationTrackingController],
  providers: [LocationTrackingGateway, LocationTrackingService],
  exports: [LocationTrackingService],
})
export class LocationTrackingModule {} 
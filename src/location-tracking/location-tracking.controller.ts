import {
  Controller,
  Get,
  Param,
  UseGuards,
  Request,
  NotFoundException,
} from '@nestjs/common';
import { LocationTrackingService } from './location-tracking.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('location-tracking')
@UseGuards(JwtAuthGuard)
export class LocationTrackingController {
  constructor(private readonly locationTrackingService: LocationTrackingService) { }

  // Simple endpoint to check if order is being tracked
  @Get('order/:orderId/tracking-status')
  async getTrackingStatus(@Param('orderId') orderId: string, @Request() req) {
    const userId = req.user?.userId;

    if (!userId) {
      throw new NotFoundException('User not authenticated');
    }

    try {
      const currentLocation = await this.locationTrackingService.getCurrentLocation(orderId, userId);

      return {
        success: true,
        orderId,
        isTracking: currentLocation.isTracking,
        hasLocationData: currentLocation.success,
        currentLocation: currentLocation.location || null,
        providerId: currentLocation.providerId,
        message: currentLocation.isTracking ? 'Order is being tracked' : 'Order is not being tracked'
      };

    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('Order not found or not accessible');
      }
      throw error;
    }
  }

  // Get current location of provider for an order
  @Get('order/:orderId/current-location')
  async getCurrentLocation(@Param('orderId') orderId: string, @Request() req) {
    const userId = req.user.userId;

    try {
      const currentLocation = await this.locationTrackingService.getCurrentLocation(orderId, userId);

      if (!currentLocation.success) {
        return {
          success: false,
          orderId,
          message: currentLocation.message,
          isTracking: false
        };
      }

      return {
        success: true,
        orderId,
        location: currentLocation.location,
        isTracking: currentLocation.isTracking,
        providerId: currentLocation.providerId
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('Order not found or not accessible');
      }
      throw error;
    }
  }

  // Simple health check
  @Get('health')
  async getHealth() {
    const activeTracking = this.locationTrackingService.getActiveTracking();

    return {
      status: 'healthy',
      activeTrackingCount: activeTracking.length,
      timestamp: new Date().toISOString(),
      message: 'Location tracking service is running'
    };
  }
} 
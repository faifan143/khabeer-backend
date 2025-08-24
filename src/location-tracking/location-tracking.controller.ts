import {
  Controller,
  Get,
  Param,
  Query,
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

  // WebSocket endpoints - these are handled by the gateway
  // Use WebSocket connection for real-time tracking

  @Get('order/:orderId/tracking-status')
  async getTrackingStatus(@Param('orderId') orderId: string, @Request() req) {
    console.log('🔍 Tracking status requested for order:', orderId);
    console.log('👤 User ID from request:', req.user?.userId);

    const userId = req.user?.userId;

    if (!userId) {
      console.log('❌ No user ID found in request');
      throw new NotFoundException('User not authenticated');
    }

    try {
      console.log('✅ User authenticated, checking order access...');

      // Simple approach: just check if there's any location data and if tracking is active
      const currentLocation = await this.locationTrackingService.getCurrentLocation(orderId, userId);
      console.log('📍 Current location result:', currentLocation);

      // Get order details for additional info
      const order = await this.locationTrackingService.getOrderDetails(orderId, userId);
      console.log('📋 Order details:', order);

      const response = {
        success: true,
        orderId,
        isTracking: currentLocation.isTracking,
        hasLocationData: currentLocation.success,
        currentLocation: currentLocation.location || null,
        providerId: currentLocation.providerId,
        orderStatus: order?.status,
        lastUpdate: currentLocation.location?.timestamp || null,
        message: currentLocation.isTracking ? 'Order is being tracked' : 'Order is not being tracked'
      };

      console.log('✅ Response prepared:', response);
      return response;

    } catch (error) {
      console.log('❌ Error occurred:', error.message);
      if (error instanceof NotFoundException) {
        throw new NotFoundException('Order not found or not accessible');
      }
      throw error;
    }
  }

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

  @Get('order/:orderId/location-history')
  async getLocationHistory(
    @Param('orderId') orderId: string,
    @Query('limit') limit: string,
    @Request() req
  ) {
    const userId = req.user.userId;
    const limitNumber = limit ? parseInt(limit) : 50;

    try {
      const history = await this.locationTrackingService.getLocationHistory(orderId, userId, limitNumber);

      return {
        success: true,
        orderId,
        locations: history.locations,
        totalLocations: history.locations.length,
        limit: limitNumber
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('Order not found or not accessible');
      }
      throw error;
    }
  }

  @Get('order/:orderId/estimated-arrival')
  async getEstimatedArrival(@Param('orderId') orderId: string, @Request() req) {
    const userId = req.user.userId;

    try {
      const estimatedTime = await this.locationTrackingService.estimateArrivalTime(orderId, userId);

      return {
        success: true,
        orderId,
        estimatedTimeMinutes: estimatedTime,
        message: estimatedTime
          ? `Estimated arrival in ${estimatedTime} minutes`
          : 'Unable to estimate arrival time - location data unavailable'
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('Order not found or not accessible');
      }
      throw error;
    }
  }

  // Admin and role-based endpoints removed for simplicity
  // Use WebSocket for real-time tracking data

  @Get('health')
  async getHealth() {
    console.log('🏥 Health check requested');
    const activeTracking = this.locationTrackingService.getActiveTracking();
    const activeConnections = this.locationTrackingService.getActiveConnections();

    const response = {
      status: 'healthy',
      activeTrackingCount: activeTracking.length,
      activeConnectionsCount: activeConnections.length,
      timestamp: new Date().toISOString(),
      message: 'Location tracking service is running'
    };

    console.log('✅ Health check response:', response);
    return response;
  }
} 
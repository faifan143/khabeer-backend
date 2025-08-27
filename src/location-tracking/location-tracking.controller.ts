import {
  Controller,
  Get,
  Param,
  UseGuards,
  Request,
  NotFoundException,
  Post,
  Body,
  Delete,
} from '@nestjs/common';
import { LocationTrackingService } from './location-tracking.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

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

  // Debug endpoint to get all active tracking sessions (Admin only)
  @Get('debug/active-tracking')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async getActiveTrackingDebug() {
    const activeTracking = this.locationTrackingService.getAllActiveTracking();

    return {
      success: true,
      activeTrackingCount: Object.keys(activeTracking).length,
      activeTracking,
      timestamp: new Date().toISOString(),
      message: 'Active tracking sessions retrieved'
    };
  }

  // Debug endpoint to get tracking status for specific order (Admin only)
  @Get('debug/order/:orderId/tracking')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async getOrderTrackingDebug(@Param('orderId') orderId: string) {
    const orderIdNumber = parseInt(orderId);
    if (isNaN(orderIdNumber)) {
      return {
        success: false,
        message: 'Invalid order ID format',
        orderId
      };
    }

    const trackingStatus = this.locationTrackingService.getTrackingStatus(orderIdNumber);

    return {
      success: true,
      orderId: orderIdNumber,
      isTracking: !!trackingStatus,
      trackingData: trackingStatus,
      timestamp: new Date().toISOString()
    };
  }

  // Debug endpoint to test JWT token parsing
  @Post('debug/test-auth')
  async testAuth(@Request() req) {
    const user = req.user;

    return {
      success: true,
      message: 'JWT token parsed successfully',
      userData: {
        userId: user?.userId,
        userRole: user?.userRole,
        userEmail: user?.userEmail,
        fullUser: user
      },
      timestamp: new Date().toISOString()
    };
  }

  // Debug endpoint to check order details
  @Get('debug/order/:orderId/details')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async getOrderDetails(@Param('orderId') orderId: string) {
    const orderIdNumber = parseInt(orderId);
    if (isNaN(orderIdNumber)) {
      return {
        success: false,
        message: 'Invalid order ID format',
        orderId
      };
    }

    try {
      // This would need to be implemented in the service or use Prisma directly
      // For now, return basic info
      return {
        success: true,
        orderId: orderIdNumber,
        message: 'Order details endpoint - implement database query',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error retrieving order details',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Debug endpoint to force clear tracking for a stuck order (Admin only)
  @Delete('debug/order/:orderId/clear-tracking')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async forceClearTracking(@Param('orderId') orderId: string) {
    const orderIdNumber = parseInt(orderId);
    if (isNaN(orderIdNumber)) {
      return {
        success: false,
        message: 'Invalid order ID format',
        orderId
      };
    }

    const wasTracking = this.locationTrackingService.forceClearTracking(orderIdNumber);

    return {
      success: true,
      orderId: orderIdNumber,
      wasTracking,
      message: wasTracking ? 'Tracking cleared successfully' : 'No tracking was active for this order',
      timestamp: new Date().toISOString()
    };
  }

  // Debug endpoint to check if specific order is being tracked
  @Get('debug/order/:orderId/is-tracking')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async checkOrderTracking(@Param('orderId') orderId: string) {
    const orderIdNumber = parseInt(orderId);
    if (isNaN(orderIdNumber)) {
      return {
        success: false,
        message: 'Invalid order ID format',
        orderId
      };
    }

    const isTracking = this.locationTrackingService.isOrderBeingTracked(orderIdNumber);
    const trackingInfo = this.locationTrackingService.getOrderTrackingInfo(orderIdNumber);

    return {
      success: true,
      orderId: orderIdNumber,
      isTracking,
      trackingInfo,
      timestamp: new Date().toISOString()
    };
  }
} 
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import { LocationTrackingService } from './location-tracking.service';
import { StartTrackingDto, StopTrackingDto, LocationUpdateDto } from './dto/location-update.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('location-tracking')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LocationTrackingController {
  constructor(private readonly locationTrackingService: LocationTrackingService) { }

  @Post('start')
  @Roles('PROVIDER')
  async startTracking(@Body() startTrackingDto: StartTrackingDto, @Request() req) {
    // This endpoint is mainly for documentation/testing
    // Real tracking should be done via WebSocket
    return {
      message: 'Please use WebSocket connection to start tracking',
      endpoint: 'ws://localhost:3000/location-tracking',
      event: 'start_tracking',
      data: startTrackingDto
    };
  }

  @Post('stop')
  @Roles('PROVIDER')
  async stopTracking(@Body() stopTrackingDto: StopTrackingDto, @Request() req) {
    // This endpoint is mainly for documentation/testing
    // Real tracking should be done via WebSocket
    return {
      message: 'Please use WebSocket connection to stop tracking',
      endpoint: 'ws://localhost:3000/location-tracking',
      event: 'stop_tracking',
      data: stopTrackingDto
    };
  }

    @Get('order/:orderId/tracking-status')
  async getTrackingStatus(@Param('orderId') orderId: string, @Request() req) {
    const userId = req.user.userId;

    try {
      // Simple approach: just check if there's any location data and if tracking is active
      const currentLocation = await this.locationTrackingService.getCurrentLocation(orderId, userId);
      
      // Get order details for additional info
      const order = await this.locationTrackingService.getOrderDetails(orderId, userId);
      
      return {
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
    } catch (error) {
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

  @Get('active-tracking')
  @Roles('ADMIN')
  async getActiveTracking() {
    return {
      activeTracking: this.locationTrackingService.getActiveTracking(),
      activeConnections: this.locationTrackingService.getActiveConnections()
    };
  }

  @Get('provider/:providerId/orders')
  @Roles('PROVIDER')
  async getProviderOrders(
    @Param('providerId', ParseIntPipe) providerId: number,
    @Request() req
  ) {
    // Verify the provider is requesting their own data
    if (req.user.userId !== providerId) {
      throw new Error('Unauthorized access to provider data');
    }

    const activeTracking = this.locationTrackingService.getActiveTracking();
    const providerOrders = activeTracking.filter(tracking => tracking.providerId === providerId);

    return {
      providerId,
      activeOrders: providerOrders.map(tracking => ({
        orderId: tracking.orderId,
        startedAt: tracking.startedAt,
        lastLocation: tracking.lastLocation
      }))
    };
  }

  @Get('user/:userId/orders')
  @Roles('USER')
  async getUserOrders(
    @Param('userId', ParseIntPipe) userId: number,
    @Request() req
  ) {
    // Verify the user is requesting their own data
    if (req.user.userId !== userId) {
      throw new Error('Unauthorized access to user data');
    }

    const activeTracking = this.locationTrackingService.getActiveTracking();
    const userOrders = activeTracking.filter(tracking => tracking.userId === userId);

    return {
      userId,
      trackedOrders: userOrders.map(tracking => ({
        orderId: tracking.orderId,
        providerId: tracking.providerId,
        startedAt: tracking.startedAt,
        lastLocation: tracking.lastLocation
      }))
    };
  }

  @Get('health')
  async getHealth() {
    const activeTracking = this.locationTrackingService.getActiveTracking();
    const activeConnections = this.locationTrackingService.getActiveConnections();

    return {
      status: 'healthy',
      activeTrackingCount: activeTracking.length,
      activeConnectionsCount: activeConnections.length,
      timestamp: new Date().toISOString()
    };
  }
} 
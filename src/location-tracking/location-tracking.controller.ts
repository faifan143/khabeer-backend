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
} from '@nestjs/common';
import { LocationTrackingService } from './location-tracking.service';
import { StartTrackingDto, StopTrackingDto, LocationUpdateDto } from './dto/location-update.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('location-tracking')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LocationTrackingController {
  constructor(private readonly locationTrackingService: LocationTrackingService) {}

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

  @Get('order/:orderId/current-location')
  @Roles('USER')
  async getCurrentLocation(
    @Param('orderId') orderId: string,
    @Request() req
  ) {
    return this.locationTrackingService.getCurrentLocation(orderId, req.user.userId);
  }

  @Get('order/:orderId/location-history')
  @Roles('USER')
  async getLocationHistory(
    @Param('orderId') orderId: string,
    @Query('limit') limit: number = 50,
    @Request() req
  ) {
    return this.locationTrackingService.getLocationHistory(
      orderId,
      req.user.userId,
      limit || 50
    );
  }

  @Get('order/:orderId/estimated-arrival')
  @Roles('USER')
  async getEstimatedArrival(
    @Param('orderId') orderId: string,
    @Request() req
  ) {
    const estimatedTime = await this.locationTrackingService.estimateArrivalTime(
      orderId,
      req.user.userId
    );

    return {
      orderId,
      estimatedTimeMinutes: estimatedTime,
      message: estimatedTime 
        ? `Estimated arrival in ${estimatedTime} minutes` 
        : 'Unable to estimate arrival time'
    };
  }

  @Get('active-tracking')
  @Roles('ADMIN')
  async getActiveTracking() {
    return {
      activeTracking: this.locationTrackingService.getActiveTracking(),
      activeConnections: this.locationTrackingService.getActiveConnections()
    };
  }

  @Get('order/:orderId/tracking-status')
  @Roles('USER', 'PROVIDER')
  async getTrackingStatus(
    @Param('orderId') orderId: string,
    @Request() req
  ) {
    const currentLocation = await this.locationTrackingService.getCurrentLocation(
      orderId,
      req.user.userId
    );

    const isTracking = currentLocation.isTracking;

    return {
      orderId,
      isTracking,
      hasLocationData: currentLocation.success,
      lastUpdate: currentLocation.success && currentLocation.location ? currentLocation.location.timestamp : null
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
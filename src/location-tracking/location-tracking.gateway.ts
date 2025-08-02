import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { LocationTrackingService } from './location-tracking.service';
import { LocationUpdateDto, StartTrackingDto, StopTrackingDto, TrackOrderDto } from './dto/location-update.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  namespace: '/location-tracking'
})
export class LocationTrackingGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(LocationTrackingGateway.name);
  private userSockets = new Map<number, string>(); // userId -> socketId
  private providerSockets = new Map<number, string>(); // providerId -> socketId

  constructor(
    private readonly locationTrackingService: LocationTrackingService,
    private readonly jwtService: JwtService
  ) {}

  afterInit(server: Server) {
    this.logger.log('Location tracking WebSocket gateway initialized');
    
    // Set up periodic cleanup of inactive connections
    setInterval(() => {
      this.locationTrackingService.cleanupInactiveConnections();
    }, 60000); // Every minute
  }

  async handleConnection(client: Socket) {
    try {
      // Extract token from handshake auth or query
      const token = client.handshake.auth.token || client.handshake.query.token;
      
      if (!token) {
        client.disconnect();
        return;
      }

      // Verify JWT token
      const payload = this.jwtService.verify(token);
      const userId = payload.userId;
      const userRole = payload.role;

      // Store socket mapping
      if (userRole === 'PROVIDER') {
        this.providerSockets.set(userId, client.id);
        this.logger.log(`Provider ${userId} connected with socket ${client.id}`);
      } else {
        this.userSockets.set(userId, client.id);
        this.logger.log(`User ${userId} connected with socket ${client.id}`);
      }

      // Store user info in socket data
      client.data.userId = userId;
      client.data.userRole = userRole;

      // Join user-specific room
      client.join(`user_${userId}`);

      client.emit('connected', {
        success: true,
        message: 'Connected to location tracking service',
        userId,
        userRole
      });

    } catch (error) {
      this.logger.error('Connection authentication failed:', error.message);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data?.userId;
    const userRole = client.data?.userRole;

    if (userRole === 'PROVIDER') {
      this.providerSockets.delete(userId);
      this.logger.log(`Provider ${userId} disconnected`);
    } else {
      this.userSockets.delete(userId);
      this.logger.log(`User ${userId} disconnected`);
    }

    // Clean up any active tracking for this connection
    this.locationTrackingService.cleanupInactiveConnections();
  }

  @SubscribeMessage('start_tracking')
  async handleStartTracking(
    @MessageBody() data: StartTrackingDto,
    @ConnectedSocket() client: Socket
  ) {
    try {
      const providerId = client.data?.userId;
      const userRole = client.data?.userRole;

      if (userRole !== 'PROVIDER') {
        client.emit('error', { message: 'Only providers can start tracking' });
        return;
      }

      const result = await this.locationTrackingService.startTracking(
        providerId,
        data,
        client.id
      );

      // Join order-specific room for real-time updates
      client.join(`order_${data.orderId}`);

      client.emit('tracking_started', result);

      // Notify the user that tracking has started
      const trackingData = this.locationTrackingService.getActiveTracking().find(
        t => t.orderId === data.orderId
      );

      if (trackingData) {
        this.server.to(`user_${trackingData.userId}`).emit('provider_tracking_started', {
          orderId: data.orderId,
          providerId: providerId,
          message: 'Provider has started location tracking'
        });
      }

    } catch (error) {
      this.logger.error('Error starting tracking:', error.message);
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('stop_tracking')
  async handleStopTracking(
    @MessageBody() data: StopTrackingDto,
    @ConnectedSocket() client: Socket
  ) {
    try {
      const providerId = client.data?.userId;
      const userRole = client.data?.userRole;

      if (userRole !== 'PROVIDER') {
        client.emit('error', { message: 'Only providers can stop tracking' });
        return;
      }

      const result = await this.locationTrackingService.stopTracking(
        providerId,
        data,
        client.id
      );

      // Leave order-specific room
      client.leave(`order_${data.orderId}`);

      client.emit('tracking_stopped', result);

      // Notify the user that tracking has stopped
      const trackingData = this.locationTrackingService.getActiveTracking().find(
        t => t.orderId === data.orderId
      );

      if (trackingData) {
        this.server.to(`user_${trackingData.userId}`).emit('provider_tracking_stopped', {
          orderId: data.orderId,
          providerId: providerId,
          message: 'Provider has stopped location tracking'
        });
      }

    } catch (error) {
      this.logger.error('Error stopping tracking:', error.message);
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('update_location')
  async handleLocationUpdate(
    @MessageBody() data: LocationUpdateDto,
    @ConnectedSocket() client: Socket
  ) {
    try {
      const providerId = client.data?.userId;
      const userRole = client.data?.userRole;

      if (userRole !== 'PROVIDER') {
        client.emit('error', { message: 'Only providers can update location' });
        return;
      }

      const result = await this.locationTrackingService.updateLocation(
        providerId,
        data,
        client.id
      );

      client.emit('location_updated', result);

      // Broadcast location update to the user tracking this order
      const trackingData = this.locationTrackingService.getActiveTracking().find(
        t => t.orderId === data.orderId
      );

      if (trackingData) {
        this.server.to(`order_${data.orderId}`).emit('provider_location_updated', {
          orderId: data.orderId,
          providerId: providerId,
          location: {
            latitude: data.latitude,
            longitude: data.longitude,
            accuracy: data.accuracy,
            timestamp: new Date()
          }
        });
      }

    } catch (error) {
      this.logger.error('Error updating location:', error.message);
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('track_order')
  async handleTrackOrder(
    @MessageBody() data: TrackOrderDto,
    @ConnectedSocket() client: Socket
  ) {
    try {
      const userId = client.data?.userId;
      const userRole = client.data?.userRole;

      if (userRole !== 'USER') {
        client.emit('error', { message: 'Only users can track orders' });
        return;
      }

      // Join order-specific room to receive updates
      client.join(`order_${data.orderId}`);

      // Get current location
      const currentLocation = await this.locationTrackingService.getCurrentLocation(
        data.orderId,
        userId
      );

      client.emit('order_tracking_started', {
        orderId: data.orderId,
        currentLocation,
        message: 'Started tracking order location'
      });

    } catch (error) {
      this.logger.error('Error tracking order:', error.message);
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('stop_tracking_order')
  async handleStopTrackingOrder(
    @MessageBody() data: TrackOrderDto,
    @ConnectedSocket() client: Socket
  ) {
    try {
      const userId = client.data?.userId;
      const userRole = client.data?.userRole;

      if (userRole !== 'USER') {
        client.emit('error', { message: 'Only users can stop tracking orders' });
        return;
      }

      // Leave order-specific room
      client.leave(`order_${data.orderId}`);

      client.emit('order_tracking_stopped', {
        orderId: data.orderId,
        message: 'Stopped tracking order location'
      });

    } catch (error) {
      this.logger.error('Error stopping order tracking:', error.message);
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('get_current_location')
  async handleGetCurrentLocation(
    @MessageBody() data: TrackOrderDto,
    @ConnectedSocket() client: Socket
  ) {
    try {
      const userId = client.data?.userId;
      const userRole = client.data?.userRole;

      if (userRole !== 'USER') {
        client.emit('error', { message: 'Only users can get location' });
        return;
      }

      const currentLocation = await this.locationTrackingService.getCurrentLocation(
        data.orderId,
        userId
      );

      client.emit('current_location', {
        orderId: data.orderId,
        ...currentLocation
      });

    } catch (error) {
      this.logger.error('Error getting current location:', error.message);
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('get_location_history')
  async handleGetLocationHistory(
    @MessageBody() data: { orderId: string; limit?: number },
    @ConnectedSocket() client: Socket
  ) {
    try {
      const userId = client.data?.userId;
      const userRole = client.data?.userRole;

      if (userRole !== 'USER') {
        client.emit('error', { message: 'Only users can get location history' });
        return;
      }

      const history = await this.locationTrackingService.getLocationHistory(
        data.orderId,
        userId,
        data.limit || 50
      );

      client.emit('location_history', {
        orderId: data.orderId,
        ...history
      });

    } catch (error) {
      this.logger.error('Error getting location history:', error.message);
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('get_estimated_arrival')
  async handleGetEstimatedArrival(
    @MessageBody() data: TrackOrderDto,
    @ConnectedSocket() client: Socket
  ) {
    try {
      const userId = client.data?.userId;
      const userRole = client.data?.userRole;

      if (userRole !== 'USER') {
        client.emit('error', { message: 'Only users can get estimated arrival' });
        return;
      }

      const estimatedTime = await this.locationTrackingService.estimateArrivalTime(
        data.orderId,
        userId
      );

      client.emit('estimated_arrival', {
        orderId: data.orderId,
        estimatedTimeMinutes: estimatedTime,
        message: estimatedTime ? `Estimated arrival in ${estimatedTime} minutes` : 'Unable to estimate arrival time'
      });

    } catch (error) {
      this.logger.error('Error getting estimated arrival:', error.message);
      client.emit('error', { message: error.message });
    }
  }

  // Method to get active tracking status (for debugging/admin purposes)
  @SubscribeMessage('get_active_tracking')
  async handleGetActiveTracking(@ConnectedSocket() client: Socket) {
    try {
      const userRole = client.data?.userRole;

      if (userRole !== 'ADMIN') {
        client.emit('error', { message: 'Only admins can get active tracking status' });
        return;
      }

      const activeTracking = this.locationTrackingService.getActiveTracking();
      const activeConnections = this.locationTrackingService.getActiveConnections();

      client.emit('active_tracking_status', {
        activeTracking,
        activeConnections,
        totalTracking: activeTracking.length,
        totalConnections: activeConnections.length
      });

    } catch (error) {
      this.logger.error('Error getting active tracking status:', error.message);
      client.emit('error', { message: error.message });
    }
  }
} 
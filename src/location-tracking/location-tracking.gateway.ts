import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UnauthorizedException } from '@nestjs/common';
import { LocationTrackingService } from './location-tracking.service';
import { LocationUpdateDto, StartTrackingDto, StopTrackingDto } from './dto/location-update.dto';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  namespace: 'location-tracking',
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
})
export class LocationTrackingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(LocationTrackingGateway.name);
  private providerSockets = new Map<number, string>(); // providerId -> socketId
  private userSockets = new Map<number, string>(); // userId -> socketId

  constructor(
    private readonly locationTrackingService: LocationTrackingService,
    private readonly jwtService: JwtService
  ) { }

  async handleConnection(client: Socket) {
    try {
      // Get JWT token from handshake auth or query
      const token = client.handshake.auth.token || client.handshake.query.token;
      
      if (!token) {
        this.logger.error('No JWT token provided');
        client.emit('error', { message: 'Authentication required' });
        client.disconnect();
        return;
      }

      // Verify JWT token
      const payload = this.jwtService.verify(token);
      
      // Set user data on socket
      client.data.userId = payload.userId;
      client.data.userRole = payload.role;
      client.data.userEmail = payload.email;

      if (payload.role === 'PROVIDER') {
        this.providerSockets.set(payload.userId, client.id);
        this.logger.log(`Provider ${payload.userId} connected`);
      } else {
        this.userSockets.set(payload.userId, client.id);
        this.logger.log(`User ${payload.userId} connected`);
      }

      client.emit('connected', { 
        userId: payload.userId, 
        userRole: payload.role,
        message: 'Successfully authenticated'
      });

    } catch (error) {
      this.logger.error('Authentication failed:', error.message);
      client.emit('error', { message: 'Authentication failed' });
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
  }

  // Provider starts sharing location
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

      const result = await this.locationTrackingService.startTracking(providerId, data);

      // Join order-specific room for real-time updates
      client.join(`order_${data.orderId}`);

      client.emit('tracking_started', result);

      // Notify the user that tracking has started
      const trackingData = this.locationTrackingService.getActiveTracking().find(
        t => t.orderId.toString() === data.orderId
      );

      if (trackingData) {
        const userSocketId = this.userSockets.get(trackingData.userId);
        if (userSocketId) {
          this.server.to(userSocketId).emit('provider_tracking_started', {
            orderId: data.orderId,
            providerId: providerId,
            message: 'Provider started sharing location'
          });
        }
      }

    } catch (error) {
      this.logger.error('Error starting tracking:', error.message);
      client.emit('error', { message: error.message });
    }
  }

  // Provider updates location
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

      const result = await this.locationTrackingService.updateLocation(providerId, data);

      client.emit('location_updated', result);

      // Broadcast location update to the user tracking this order
      const trackingData = this.locationTrackingService.getActiveTracking().find(
        t => t.orderId.toString() === data.orderId
      );

      if (trackingData) {
        const userSocketId = this.userSockets.get(trackingData.userId);
        if (userSocketId) {
          this.server.to(userSocketId).emit('provider_location_updated', {
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
      }

    } catch (error) {
      this.logger.error('Error updating location:', error.message);
      client.emit('error', { message: error.message });
    }
  }

  // Provider stops sharing location
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

      const result = await this.locationTrackingService.stopTracking(providerId, data);

      // Leave order-specific room
      client.leave(`order_${data.orderId}`);

      client.emit('tracking_stopped', result);

      // Notify the user that tracking has stopped
      const trackingData = this.locationTrackingService.getActiveTracking().find(
        t => t.orderId.toString() === data.orderId
      );

      if (trackingData) {
        const userSocketId = this.userSockets.get(trackingData.userId);
        if (userSocketId) {
          this.server.to(userSocketId).emit('provider_tracking_stopped', {
            orderId: data.orderId,
            providerId: providerId,
            message: 'Provider stopped sharing location'
          });
        }
      }

    } catch (error) {
      this.logger.error('Error stopping tracking:', error.message);
      client.emit('error', { message: error.message });
    }
  }

  // User starts listening to provider location
  @SubscribeMessage('track_order')
  async handleTrackOrder(
    @MessageBody() data: { orderId: string },
    @ConnectedSocket() client: Socket
  ) {
    try {
      const userId = client.data?.userId;
      const userRole = client.data?.userRole;

      if (userRole !== 'USER') {
        client.emit('error', { message: 'Only users can track orders' });
        return;
      }

      // Join order-specific room
      client.join(`order_${data.orderId}`);

      // Get current location if available
      const currentLocation = await this.locationTrackingService.getCurrentLocation(data.orderId, userId);

      client.emit('order_tracking_started', {
        orderId: data.orderId,
        currentLocation: currentLocation.location,
        isTracking: currentLocation.isTracking,
        providerId: currentLocation.providerId,
        message: 'Started listening to provider location'
      });

    } catch (error) {
      this.logger.error('Error starting order tracking:', error.message);
      client.emit('error', { message: error.message });
    }
  }

  // User stops listening to provider location
  @SubscribeMessage('stop_tracking_order')
  async handleStopTrackingOrder(
    @MessageBody() data: { orderId: string },
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
        message: 'Stopped listening to provider location'
      });

    } catch (error) {
      this.logger.error('Error stopping order tracking:', error.message);
      client.emit('error', { message: error.message });
    }
  }
} 
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { LocationUpdateDto, StartTrackingDto, StopTrackingDto } from './dto/location-update.dto';
import { LocationTrackingService } from './location-tracking.service';

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
      let payload: any;
      try {
        payload = this.jwtService.verify(token);
      } catch (jwtError) {
        this.logger.error('JWT verification failed:', jwtError.message);
        client.emit('error', { message: 'Invalid or expired token' });
        client.disconnect();
        return;
      }

      // Extract user data from JWT payload
      // The JWT payload structure is: { username, sub, role }
      const userId = payload.sub;           // ✅ Use 'sub' field for user ID
      const userRole = payload.role;        // ✅ Use 'role' field
      const userEmail = payload.username;   // ✅ Use 'username' field for email

      if (!userId || !userRole) {
        this.logger.error('Invalid JWT payload - missing userId or role');
        client.emit('error', { message: 'Invalid token payload' });
        client.disconnect();
        return;
      }

      // Set user data on socket
      client.data.userId = userId;
      client.data.userRole = userRole;
      client.data.userEmail = userEmail;

      if (userRole === 'PROVIDER') {
        this.providerSockets.set(userId, client.id);
        this.logger.log(`Provider ${userId} connected with socket ${client.id}`);
      } else if (userRole === 'USER') {
        this.userSockets.set(userId, client.id);
        this.logger.log(`User ${userId} connected with socket ${client.id}`);
      } else {
        this.logger.warn(`Unknown role ${userRole} for user ${userId}`);
        client.emit('error', { message: 'Invalid user role' });
        client.disconnect();
        return;
      }

      client.emit('connected', {
        userId: userId,
        userRole: userRole,
        userEmail: userEmail,
        message: 'Successfully authenticated'
      });

      this.logger.log(`User ${userId} (${userRole}) successfully authenticated`);

    } catch (error) {
      this.logger.error('Authentication failed:', error.message);
      client.emit('error', { message: 'Authentication failed' });
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data?.userId;
    const userRole = client.data?.userRole;

    if (userId && userRole) {
      if (userRole === 'PROVIDER') {
        this.providerSockets.delete(userId);
        this.logger.log(`Provider ${userId} disconnected from socket ${client.id}`);

        // 🔥 CRITICAL FIX: Clear all tracking sessions for this provider
        const clearedCount = this.locationTrackingService.clearProviderTracking(userId);
        this.logger.log(`Cleared ${clearedCount} tracking sessions for disconnected provider ${userId}`);
      } else if (userRole === 'USER') {
        this.userSockets.delete(userId);
        this.logger.log(`User ${userId} disconnected from socket ${client.id}`);
      }
    } else {
      this.logger.warn(`Socket ${client.id} disconnected without user data`);
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

      this.logger.log(`Provider ${providerId} attempting to start tracking for order ${data.orderId}`);

      if (!providerId || !userRole) {
        this.logger.error('Missing user data in socket');
        client.emit('error', { message: 'Authentication required' });
        return;
      }

      if (userRole !== 'PROVIDER') {
        this.logger.warn(`User ${providerId} with role ${userRole} attempted to start tracking`);
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
          this.logger.log(`Notified user ${trackingData.userId} that provider ${providerId} started tracking`);
        } else {
          this.logger.warn(`User ${trackingData.userId} not connected for order ${data.orderId}`);
        }
      }

      this.logger.log(`Provider ${providerId} successfully started tracking order ${data.orderId}`);

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

      if (!providerId || !userRole) {
        this.logger.error('Missing user data in socket');
        client.emit('error', { message: 'Authentication required' });
        return;
      }

      if (userRole !== 'PROVIDER') {
        this.logger.warn(`User ${providerId} with role ${userRole} attempted to update location`);
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
          this.logger.log(`Location update sent to user ${trackingData.userId} for order ${data.orderId}`);
        } else {
          this.logger.warn(`User ${trackingData.userId} not connected for order ${data.orderId}`);
        }
      }

      this.logger.log(`Provider ${providerId} location updated for order ${data.orderId}: ${data.latitude}, ${data.longitude}`);

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

      if (!providerId || !userRole) {
        this.logger.error('Missing user data in socket');
        client.emit('error', { message: 'Authentication required' });
        return;
      }

      if (userRole !== 'PROVIDER') {
        this.logger.warn(`User ${providerId} with role ${userRole} attempted to stop tracking`);
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
          this.logger.log(`Notified user ${trackingData.userId} that provider ${providerId} stopped tracking`);
        } else {
          this.logger.warn(`User ${trackingData.userId} not connected for order ${data.orderId}`);
        }
      }

      this.logger.log(`Provider ${providerId} successfully stopped tracking order ${data.orderId}`);

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

      if (!userId || !userRole) {
        this.logger.error('Missing user data in socket');
        client.emit('error', { message: 'Authentication required' });
        return;
      }

      if (userRole !== 'USER') {
        this.logger.warn(`User ${userId} with role ${userRole} attempted to track order`);
        client.emit('error', { message: 'Only users can track orders' });
        return;
      }

      this.logger.log(`User ${userId} attempting to track order ${data.orderId}`);

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

      this.logger.log(`User ${userId} successfully started tracking order ${data.orderId}`);

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

      if (!userId || !userRole) {
        this.logger.error('Missing user data in socket');
        client.emit('error', { message: 'Authentication required' });
        return;
      }

      if (userRole !== 'USER') {
        this.logger.warn(`User ${userId} with role ${userRole} attempted to stop tracking order`);
        client.emit('error', { message: 'Only users can stop tracking orders' });
        return;
      }

      // Leave order-specific room
      client.leave(`order_${data.orderId}`);

      client.emit('order_tracking_stopped', {
        orderId: data.orderId,
        message: 'Stopped listening to provider location'
      });

      this.logger.log(`User ${userId} stopped tracking order ${data.orderId}`);

    } catch (error) {
      this.logger.error('Error stopping order tracking:', error.message);
      client.emit('error', { message: error.message });
    }
  }

  // Debug method to get current socket status
  @SubscribeMessage('get_socket_status')
  async handleGetSocketStatus(@ConnectedSocket() client: Socket) {
    const userId = client.data?.userId;
    const userRole = client.data?.userRole;
    const userEmail = client.data?.userEmail;

    client.emit('socket_status', {
      userId,
      userRole,
      userEmail,
      socketId: client.id,
      connected: client.connected,
      providerSocketsCount: this.providerSockets.size,
      userSocketsCount: this.userSockets.size
    });
  }
} 
import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LocationUpdateDto, LocationData, StartTrackingDto, StopTrackingDto } from './dto/location-update.dto';

@Injectable()
export class LocationTrackingService {
  private readonly logger = new Logger(LocationTrackingService.name);
  private activeConnections = new Map<string, any>(); // socketId -> connection data
  private activeTracking = new Map<string, any>(); // orderId -> tracking data

  constructor(private readonly prisma: PrismaService) {}

  async startTracking(providerId: number, startTrackingDto: StartTrackingDto, socketId: string) {
    const { orderId, updateInterval = 30 } = startTrackingDto;

    // Verify order exists and provider is assigned
    const order = await this.prisma.order.findFirst({
      where: {
        bookingId: orderId,
        providerId: providerId,
        status: {
          in: ['accepted', 'in_progress']
        }
      },
      include: {
        provider: true,
        user: true
      }
    });

    if (!order) {
      throw new NotFoundException('Order not found or not accessible');
    }

    // Store connection data
    this.activeConnections.set(socketId, {
      providerId,
      orderId,
      userId: order.userId,
      connectedAt: new Date(),
      lastActivity: new Date()
    });

    // Store tracking data
    this.activeTracking.set(orderId, {
      providerId,
      userId: order.userId,
      socketId,
      updateInterval,
      startedAt: new Date(),
      lastLocation: null
    });

    this.logger.log(`Started tracking for order ${orderId} by provider ${providerId}`);

    return {
      success: true,
      orderId,
      updateInterval,
      message: 'Location tracking started successfully'
    };
  }

  async stopTracking(providerId: number, stopTrackingDto: StopTrackingDto, socketId: string) {
    const { orderId } = stopTrackingDto;

    // Verify tracking is active
    const trackingData = this.activeTracking.get(orderId);
    if (!trackingData || trackingData.providerId !== providerId) {
      throw new BadRequestException('Tracking not active for this order');
    }

    // Remove from active tracking
    this.activeTracking.delete(orderId);
    this.activeConnections.delete(socketId);

    this.logger.log(`Stopped tracking for order ${orderId} by provider ${providerId}`);

    return {
      success: true,
      orderId,
      message: 'Location tracking stopped successfully'
    };
  }

  async updateLocation(providerId: number, locationUpdateDto: LocationUpdateDto, socketId: string) {
    const { latitude, longitude, accuracy, orderId } = locationUpdateDto;

    // Validate location data
    if (latitude < -90 || latitude > 90) {
      throw new BadRequestException('Invalid latitude value');
    }
    if (longitude < -180 || longitude > 180) {
      throw new BadRequestException('Invalid longitude value');
    }

    // Check if tracking is active
    if (!orderId) {
      throw new BadRequestException('Order ID is required');
    }
    const trackingData = this.activeTracking.get(orderId);
    if (!trackingData || trackingData.providerId !== providerId) {
      throw new BadRequestException('Tracking not active for this order');
    }

    // Update connection activity
    const connectionData = this.activeConnections.get(socketId);
    if (connectionData) {
      connectionData.lastActivity = new Date();
    }

    // Store location update in database
    if (!orderId) {
      throw new BadRequestException('Order ID is required');
    }
    const locationRecord = await this.prisma.locationTracking.create({
      data: {
        orderId: parseInt(orderId),
        providerId,
        latitude,
        longitude,
        accuracy: accuracy || null,
        timestamp: new Date(),
        isActive: true
      }
    });

    // Update order with latest provider location
    await this.prisma.order.update({
      where: { bookingId: orderId },
      data: {
        providerLocation: { lat: latitude, lng: longitude }
      }
    });

    // Update tracking data
    trackingData.lastLocation = {
      latitude,
      longitude,
      accuracy,
      timestamp: new Date()
    };

    this.logger.debug(`Location updated for order ${orderId}: ${latitude}, ${longitude}`);

    return {
      success: true,
      locationId: locationRecord.id,
      timestamp: locationRecord.timestamp
    };
  }

  async getCurrentLocation(orderId: string, userId: number) {
    // Verify user has access to this order
    const order = await this.prisma.order.findFirst({
      where: {
        bookingId: orderId,
        userId: userId
      }
    });

    if (!order) {
      throw new NotFoundException('Order not found or not accessible');
    }

    // Get latest location from database
    const latestLocation = await this.prisma.locationTracking.findFirst({
      where: {
        orderId: order.id,
        isActive: true
      },
      orderBy: {
        timestamp: 'desc'
      }
    });

    if (!latestLocation) {
      return {
        success: false,
        message: 'No location data available',
        isTracking: false
      };
    }

    // Check if tracking is currently active
    const isTracking = this.activeTracking.has(orderId);

    return {
      success: true,
      location: {
        latitude: latestLocation.latitude,
        longitude: latestLocation.longitude,
        accuracy: latestLocation.accuracy,
        timestamp: latestLocation.timestamp
      },
      isTracking,
      providerId: latestLocation.providerId
    };
  }

  async getLocationHistory(orderId: string, userId: number, limit: number = 50) {
    // Verify user has access to this order
    const order = await this.prisma.order.findFirst({
      where: {
        bookingId: orderId,
        userId: userId
      }
    });

    if (!order) {
      throw new NotFoundException('Order not found or not accessible');
    }

    const locations = await this.prisma.locationTracking.findMany({
      where: {
        orderId: order.id,
        isActive: true
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: limit
    });

    return {
      success: true,
      locations: locations.map(loc => ({
        latitude: loc.latitude,
        longitude: loc.longitude,
        accuracy: loc.accuracy,
        timestamp: loc.timestamp
      }))
    };
  }

  async calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): Promise<number> {
    // Haversine formula to calculate distance between two points
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return distance;
  }

  async estimateArrivalTime(orderId: string, userId: number): Promise<number | null> {
    const order = await this.prisma.order.findFirst({
      where: {
        bookingId: orderId,
        userId: userId
      },
      include: {
        provider: true
      }
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Get latest location
    const latestLocation = await this.prisma.locationTracking.findFirst({
      where: {
        orderId: order.id,
        isActive: true
      },
      orderBy: {
        timestamp: 'desc'
      }
    });

    if (!latestLocation) {
      return null;
    }

    // Get user's location (you might want to store this in the order or get it from user profile)
    // For now, we'll use a placeholder - you should implement this based on your user location storage
    const userLat = 0; // Replace with actual user location
    const userLng = 0; // Replace with actual user location

    if (userLat === 0 && userLng === 0) {
      return null; // No user location available
    }

    // Calculate distance
    const distance = await this.calculateDistance(
      Number(latestLocation.latitude),
      Number(latestLocation.longitude),
      userLat,
      userLng
    );

    // Estimate time based on average speed (assuming 30 km/h in city)
    const averageSpeed = 30; // km/h
    const estimatedTimeMinutes = (distance / averageSpeed) * 60;

    return Math.round(estimatedTimeMinutes);
  }

  getActiveTracking() {
    return Array.from(this.activeTracking.entries()).map(([orderId, data]) => ({
      orderId,
      providerId: data.providerId,
      userId: data.userId,
      startedAt: data.startedAt,
      lastLocation: data.lastLocation
    }));
  }

  getActiveConnections() {
    return Array.from(this.activeConnections.entries()).map(([socketId, data]) => ({
      socketId,
      providerId: data.providerId,
      orderId: data.orderId,
      connectedAt: data.connectedAt,
      lastActivity: data.lastActivity
    }));
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Cleanup inactive connections
  async cleanupInactiveConnections() {
    const now = new Date();
    const inactiveThreshold = 5 * 60 * 1000; // 5 minutes

    for (const [socketId, connection] of this.activeConnections.entries()) {
      const timeSinceLastActivity = now.getTime() - connection.lastActivity.getTime();
      
      if (timeSinceLastActivity > inactiveThreshold) {
        this.activeConnections.delete(socketId);
        this.activeTracking.delete(connection.orderId);
        this.logger.log(`Cleaned up inactive connection for order ${connection.orderId}`);
      }
    }
  }
} 
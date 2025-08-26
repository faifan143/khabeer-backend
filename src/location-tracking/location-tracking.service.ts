import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LocationUpdateDto, StartTrackingDto, StopTrackingDto } from './dto/location-update.dto';

@Injectable()
export class LocationTrackingService {
  private readonly logger = new Logger(LocationTrackingService.name);
  private activeTracking = new Map<number, any>(); // orderId -> tracking data

  constructor(private readonly prisma: PrismaService) { }

  // Provider starts sharing location for an order
  async startTracking(providerId: number, startTrackingDto: StartTrackingDto) {
    const { orderId } = startTrackingDto;

    // Parse orderId to number
    const orderIdNumber = parseInt(orderId);
    if (isNaN(orderIdNumber)) {
      throw new BadRequestException(`Invalid order ID: ${orderId}. Must be a number.`);
    }

    // Check if order exists and provider is assigned
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderIdNumber,
        providerId: providerId,
        status: {
          in: ['accepted', 'in_progress']
        }
      }
    });

    if (!order) {
      throw new NotFoundException(`Order ${orderIdNumber} not found or not accessible`);
    }

    // Check if already tracking
    if (this.activeTracking.has(orderIdNumber)) {
      throw new BadRequestException(`Already tracking order ${orderIdNumber}`);
    }

    // Start tracking
    this.activeTracking.set(orderIdNumber, {
      orderId: orderIdNumber,
      providerId: providerId,
      userId: order.userId,
      startedAt: new Date(),
      lastLocation: null
    });

    this.logger.log(`Started tracking order ${orderIdNumber} for provider ${providerId}`);

    return {
      success: true,
      orderId: orderIdNumber,
      message: 'Location tracking started successfully'
    };
  }

  // Provider updates location
  async updateLocation(providerId: number, locationUpdateDto: LocationUpdateDto) {
    const { latitude, longitude, accuracy, orderId } = locationUpdateDto;

    // Validate coordinates
    if (latitude < -90 || latitude > 90) {
      throw new BadRequestException('Invalid latitude value');
    }
    if (longitude < -180 || longitude > 180) {
      throw new BadRequestException('Invalid longitude value');
    }

    // Check if orderId is provided
    if (!orderId) {
      throw new BadRequestException('Order ID is required');
    }

    // Parse orderId
    const orderIdNumber = parseInt(orderId);
    if (isNaN(orderIdNumber)) {
      throw new BadRequestException(`Invalid order ID: ${orderId}. Must be a number.`);
    }

    // Check if tracking is active
    const trackingData = this.activeTracking.get(orderIdNumber);
    if (!trackingData || trackingData.providerId !== providerId) {
      throw new BadRequestException('Not tracking this order');
    }

    // Update location
    const locationData = {
      latitude,
      longitude,
      accuracy: accuracy || 0,
      timestamp: new Date()
    };

    trackingData.lastLocation = locationData;
    this.activeTracking.set(orderIdNumber, trackingData);

    // Save to database
    await this.prisma.locationTracking.create({
      data: {
        orderId: orderIdNumber,
        providerId: providerId,
        latitude,
        longitude,
        accuracy: accuracy || 0,
        timestamp: new Date(),
        isActive: true
      }
    });

    this.logger.log(`Location updated for order ${orderIdNumber}: ${latitude}, ${longitude}`);

    return {
      success: true,
      locationId: Date.now(),
      timestamp: locationData.timestamp
    };
  }

  // Provider stops sharing location
  async stopTracking(providerId: number, stopTrackingDto: StopTrackingDto) {
    const { orderId } = stopTrackingDto;

    const orderIdNumber = parseInt(orderId);
    if (isNaN(orderIdNumber)) {
      throw new BadRequestException(`Invalid order ID: ${orderId}. Must be a number.`);
    }

    const trackingData = this.activeTracking.get(orderIdNumber);
    if (!trackingData || trackingData.providerId !== providerId) {
      throw new BadRequestException('Not tracking this order');
    }

    // Stop tracking
    this.activeTracking.delete(orderIdNumber);

    this.logger.log(`Stopped tracking order ${orderIdNumber} for provider ${providerId}`);

    return {
      success: true,
      orderId: orderIdNumber,
      message: 'Location tracking stopped successfully'
    };
  }

  // User gets current location of provider for an order
  async getCurrentLocation(orderId: string, userId: number) {
    const orderIdNumber = parseInt(orderId);
    if (isNaN(orderIdNumber)) {
      throw new BadRequestException(`Invalid order ID: ${orderId}. Must be a number.`);
    }

    // Check if user owns this order
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderIdNumber,
        userId: userId
      }
    });

    if (!order) {
      throw new NotFoundException('Order not found or not accessible');
    }

    // Get current tracking data
    const trackingData = this.activeTracking.get(orderIdNumber);
    if (!trackingData) {
      return {
        success: false,
        message: 'Order is not being tracked',
        isTracking: false
      };
    }

    return {
      success: true,
      location: trackingData.lastLocation,
      isTracking: true,
      providerId: trackingData.providerId
    };
  }

  // Get active tracking status (simple version)
  getActiveTracking() {
    return Array.from(this.activeTracking.values());
  }
} 
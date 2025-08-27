import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LocationUpdateDto, StartTrackingDto, StopTrackingDto } from './dto/location-update.dto';

@Injectable()
export class LocationTrackingService {
  private readonly logger = new Logger(LocationTrackingService.name);
  private activeTracking = new Map<number, any>(); // orderId -> tracking data

  constructor(private readonly prisma: PrismaService) { }

  // 🔥 CRITICAL FIX: Helper method to safely convert numbers to Decimal strings
  private toDecimalString(value: number, precision: number = 8): string {
    if (typeof value !== 'number' || isNaN(value)) {
      throw new BadRequestException(`Invalid number value: ${value}`);
    }
    return value.toFixed(precision);
  }

  // Provider starts sharing location for an order
  async startTracking(providerId: number, startTrackingDto: StartTrackingDto) {
    const { orderId } = startTrackingDto;

    this.logger.log(`Provider ${providerId} attempting to start tracking for order ${orderId}`);

    // Parse orderId to number
    const orderIdNumber = parseInt(orderId);
    if (isNaN(orderIdNumber)) {
      this.logger.error(`Invalid order ID format: ${orderId}`);
      throw new BadRequestException(`Invalid order ID: ${orderId}. Must be a number.`);
    }

    this.logger.log(`Parsed order ID: ${orderIdNumber}`);

    // 🔥 CRITICAL FIX: Validate provider access first
    const hasAccess = await this.validateProviderOrderAccess(providerId, orderIdNumber);
    if (!hasAccess) {
      this.logger.error(`Provider ${providerId} does not have access to order ${orderIdNumber}`);
      throw new NotFoundException(`Order ${orderIdNumber} not found or not accessible`);
    }

    // Check if order exists and provider is assigned (redundant but kept for logging)
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
      this.logger.error(`Order ${orderIdNumber} not found or not accessible for provider ${providerId}`);
      throw new NotFoundException(`Order ${orderIdNumber} not found or not accessible`);
    }

    this.logger.log(`Order ${orderIdNumber} found: status=${order.status}, userId=${order.userId}, providerId=${order.providerId}`);

    // 🔥 CRITICAL FIX: Use atomic operation to prevent race conditions
    const existingTracking = this.activeTracking.get(orderIdNumber);
    if (existingTracking) {
      // Check if the same provider is already tracking
      if (existingTracking.providerId === providerId) {
        this.logger.warn(`Provider ${providerId} is already tracking order ${orderIdNumber}`);
        throw new BadRequestException(`Already tracking order ${orderIdNumber}`);
      } else {
        // Another provider is tracking, remove their tracking and take over
        this.logger.log(`Replacing tracking for order ${orderIdNumber} from provider ${existingTracking.providerId} to ${providerId}`);
        this.activeTracking.delete(orderIdNumber);
      }
    }

    // Start tracking
    const trackingData = {
      orderId: orderIdNumber,
      providerId: providerId,
      userId: order.userId,
      startedAt: new Date(),
      lastLocation: null
    };

    this.activeTracking.set(orderIdNumber, trackingData);

    this.logger.log(`Started tracking order ${orderIdNumber} for provider ${providerId}, user ${order.userId}`);
    this.logger.log(`Active tracking count: ${this.activeTracking.size}`);

    return {
      success: true,
      orderId: orderIdNumber,
      message: 'Location tracking started successfully'
    };
  }

  // Provider updates location
  async updateLocation(providerId: number, locationUpdateDto: LocationUpdateDto) {
    const { latitude, longitude, accuracy, orderId } = locationUpdateDto;

    this.logger.log(`Provider ${providerId} updating location for order ${orderId}: ${latitude}, ${longitude}`);

    // 🔥 CRITICAL FIX: Validate coordinates with proper decimal precision
    if (typeof latitude !== 'number' || isNaN(latitude)) {
      this.logger.error(`Invalid latitude type: ${typeof latitude}, value: ${latitude}`);
      throw new BadRequestException('Invalid latitude value - must be a valid number');
    }

    if (typeof longitude !== 'number' || isNaN(longitude)) {
      this.logger.error(`Invalid longitude type: ${typeof longitude}, value: ${longitude}`);
      throw new BadRequestException('Invalid longitude value - must be a valid number');
    }

    // Validate coordinate ranges
    if (latitude < -90 || latitude > 90) {
      this.logger.error(`Invalid latitude value: ${latitude}`);
      throw new BadRequestException('Invalid latitude value - must be between -90 and 90');
    }

    if (longitude < -180 || longitude > 180) {
      this.logger.error(`Invalid longitude value: ${longitude}`);
      throw new BadRequestException('Invalid longitude value - must be between -180 and 180');
    }

    // Validate accuracy if provided
    if (accuracy !== undefined && (typeof accuracy !== 'number' || accuracy < 0 || accuracy > 1000)) {
      this.logger.error(`Invalid accuracy value: ${accuracy}`);
      throw new BadRequestException('Invalid accuracy value - must be between 0 and 1000');
    }

    // Check if orderId is provided
    if (!orderId) {
      this.logger.error('Order ID is missing in location update');
      throw new BadRequestException('Order ID is required');
    }

    // Parse orderId
    const orderIdNumber = parseInt(orderId);
    if (isNaN(orderIdNumber)) {
      this.logger.error(`Invalid order ID format: ${orderId}`);
      throw new BadRequestException(`Invalid order ID: ${orderId}. Must be a number.`);
    }

    // Check if tracking is active
    const trackingData = this.activeTracking.get(orderIdNumber);
    if (!trackingData) {
      this.logger.error(`Order ${orderIdNumber} is not being tracked`);
      throw new BadRequestException('Not tracking this order');
    }

    if (trackingData.providerId !== providerId) {
      this.logger.error(`Provider ${providerId} attempting to update location for order ${orderIdNumber} tracked by provider ${trackingData.providerId}`);
      throw new BadRequestException('Not tracking this order');
    }

    // 🔥 CRITICAL FIX: Use database transaction for atomic updates
    try {
      // Save to database FIRST (if this fails, don't update memory)
      await this.prisma.locationTracking.create({
        data: {
          orderId: orderIdNumber,
          providerId: providerId,
          // 🔥 CRITICAL FIX: Convert to Decimal for Prisma using helper method
          latitude: this.toDecimalString(latitude, 8),
          longitude: this.toDecimalString(longitude, 8),
          accuracy: accuracy !== undefined ? this.toDecimalString(accuracy, 2) : null,
          timestamp: new Date(),
          isActive: true
          // 🔥 CRITICAL FIX: Remove order and provider connections - use foreign keys directly
        }
      });
      this.logger.log(`Location data saved to database for order ${orderIdNumber}`);

      // Only update memory AFTER successful database save
      const locationData = {
        latitude,
        longitude,
        accuracy: accuracy || 0,
        timestamp: new Date()
      };

      trackingData.lastLocation = locationData;
      this.activeTracking.set(orderIdNumber, trackingData);

      this.logger.log(`Updated tracking data for order ${orderIdNumber}: ${JSON.stringify(locationData)}`);
      this.logger.log(`Location updated for order ${orderIdNumber}: ${latitude}, ${longitude}`);

      return {
        success: true,
        locationId: Date.now(),
        timestamp: locationData.timestamp
      };

    } catch (dbError) {
      this.logger.error(`Failed to save location to database: ${dbError.message}`);

      // Log specific error details
      if (dbError.code === 'P2003') {
        this.logger.error(`Foreign key constraint failed - check if order ${orderIdNumber} or provider ${providerId} exists`);
      } else if (dbError.code === 'P2002') {
        this.logger.error(`Unique constraint failed - duplicate location entry`);
      }

      // Re-throw the error so the client knows the update failed
      throw new BadRequestException(`Failed to save location: ${dbError.message}`);
    }
  }

  // Provider stops sharing location
  async stopTracking(providerId: number, stopTrackingDto: StopTrackingDto) {
    const { orderId } = stopTrackingDto;

    this.logger.log(`Provider ${providerId} attempting to stop tracking for order ${orderId}`);

    const orderIdNumber = parseInt(orderId);
    if (isNaN(orderIdNumber)) {
      this.logger.error(`Invalid order ID format: ${orderId}`);
      throw new BadRequestException(`Invalid order ID: ${orderId}. Must be a number.`);
    }

    const trackingData = this.activeTracking.get(orderIdNumber);
    if (!trackingData) {
      this.logger.error(`Order ${orderIdNumber} is not being tracked`);
      throw new BadRequestException('Not tracking this order');
    }

    if (trackingData.providerId !== providerId) {
      this.logger.error(`Provider ${providerId} attempting to stop tracking for order ${orderIdNumber} tracked by provider ${trackingData.providerId}`);
      throw new BadRequestException('Not tracking this order');
    }

    // Stop tracking
    this.activeTracking.delete(orderIdNumber);

    this.logger.log(`Stopped tracking order ${orderIdNumber} for provider ${providerId}`);
    this.logger.log(`Active tracking count: ${this.activeTracking.size}`);

    return {
      success: true,
      orderId: orderIdNumber,
      message: 'Location tracking stopped successfully'
    };
  }

  // User gets current location of provider for an order
  async getCurrentLocation(orderId: string, userId: number) {
    this.logger.log(`User ${userId} requesting current location for order ${orderId}`);

    const orderIdNumber = parseInt(orderId);
    if (isNaN(orderIdNumber)) {
      this.logger.error(`Invalid order ID format: ${orderId}`);
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
      this.logger.error(`Order ${orderIdNumber} not found or not accessible for user ${userId}`);
      throw new NotFoundException('Order not found or not accessible');
    }

    this.logger.log(`Order ${orderIdNumber} found for user ${userId}: status=${order.status}, providerId=${order.providerId}`);

    // Get current tracking data
    const trackingData = this.activeTracking.get(orderIdNumber);
    if (!trackingData) {
      this.logger.log(`Order ${orderIdNumber} is not being tracked`);
      return {
        success: false,
        message: 'Order is not being tracked',
        isTracking: false
      };
    }

    this.logger.log(`Order ${orderIdNumber} is being tracked by provider ${trackingData.providerId}`);

    return {
      success: true,
      location: trackingData.lastLocation,
      isTracking: true,
      providerId: trackingData.providerId
    };
  }

  // Get active tracking status (simple version)
  getActiveTracking() {
    const trackingList = Array.from(this.activeTracking.values());
    this.logger.log(`Returning ${trackingList.length} active tracking sessions`);
    return trackingList;
  }

  // Debug method to get tracking status
  getTrackingStatus(orderId: number) {
    const trackingData = this.activeTracking.get(orderId);
    if (trackingData) {
      this.logger.log(`Order ${orderId} tracking status: ${JSON.stringify(trackingData)}`);
    } else {
      this.logger.log(`Order ${orderId} is not being tracked`);
    }
    return trackingData;
  }

  // Get all active tracking data for debugging
  getAllActiveTracking() {
    const result = {};
    for (const [orderId, data] of this.activeTracking.entries()) {
      result[orderId] = data;
    }
    this.logger.log(`All active tracking: ${JSON.stringify(result)}`);
    return result;
  }

  // Force clear tracking for an order (for debugging/admin use)
  forceClearTracking(orderId: number) {
    const wasTracking = this.activeTracking.has(orderId);
    if (wasTracking) {
      this.activeTracking.delete(orderId);
      this.logger.log(`Force cleared tracking for order ${orderId}`);
    }
    return wasTracking;
  }

  // 🔥 CRITICAL FIX: Clear all tracking sessions for a specific provider
  clearProviderTracking(providerId: number) {
    let clearedCount = 0;
    const ordersToClear: number[] = [];

    // Find all orders being tracked by this provider
    for (const [orderId, trackingData] of this.activeTracking.entries()) {
      if (trackingData.providerId === providerId) {
        ordersToClear.push(orderId);
      }
    }

    // Clear them
    for (const orderId of ordersToClear) {
      this.activeTracking.delete(orderId);
      clearedCount++;
      this.logger.log(`Cleared tracking for order ${orderId} due to provider ${providerId} disconnection`);
    }

    this.logger.log(`Cleared ${clearedCount} tracking sessions for provider ${providerId}`);
    return clearedCount;
  }

  // Check if a specific order is being tracked
  isOrderBeingTracked(orderId: number): boolean {
    return this.activeTracking.has(orderId);
  }

  // Get tracking info for a specific order
  getOrderTrackingInfo(orderId: number) {
    return this.activeTracking.get(orderId) || null;
  }

  // 🔥 CRITICAL FIX: Validate provider can track this order
  async validateProviderOrderAccess(providerId: number, orderId: number): Promise<boolean> {
    try {
      const order = await this.prisma.order.findFirst({
        where: {
          id: orderId,
          providerId: providerId,
          status: {
            in: ['accepted', 'in_progress']
          }
        }
      });

      return !!order;
    } catch (error) {
      this.logger.error(`Error validating provider order access: ${error.message}`);
      return false;
    }
  }
} 
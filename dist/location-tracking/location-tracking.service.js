"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var LocationTrackingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocationTrackingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let LocationTrackingService = LocationTrackingService_1 = class LocationTrackingService {
    prisma;
    logger = new common_1.Logger(LocationTrackingService_1.name);
    activeConnections = new Map();
    activeTracking = new Map();
    constructor(prisma) {
        this.prisma = prisma;
    }
    async startTracking(providerId, startTrackingDto, socketId) {
        const { orderId, updateInterval = 30 } = startTrackingDto;
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
            throw new common_1.NotFoundException('Order not found or not accessible');
        }
        this.activeConnections.set(socketId, {
            providerId,
            orderId,
            userId: order.userId,
            connectedAt: new Date(),
            lastActivity: new Date()
        });
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
    async stopTracking(providerId, stopTrackingDto, socketId) {
        const { orderId } = stopTrackingDto;
        const trackingData = this.activeTracking.get(orderId);
        if (!trackingData || trackingData.providerId !== providerId) {
            throw new common_1.BadRequestException('Tracking not active for this order');
        }
        this.activeTracking.delete(orderId);
        this.activeConnections.delete(socketId);
        this.logger.log(`Stopped tracking for order ${orderId} by provider ${providerId}`);
        return {
            success: true,
            orderId,
            message: 'Location tracking stopped successfully'
        };
    }
    async updateLocation(providerId, locationUpdateDto, socketId) {
        const { latitude, longitude, accuracy, orderId } = locationUpdateDto;
        if (latitude < -90 || latitude > 90) {
            throw new common_1.BadRequestException('Invalid latitude value');
        }
        if (longitude < -180 || longitude > 180) {
            throw new common_1.BadRequestException('Invalid longitude value');
        }
        if (!orderId) {
            throw new common_1.BadRequestException('Order ID is required');
        }
        const trackingData = this.activeTracking.get(orderId);
        if (!trackingData || trackingData.providerId !== providerId) {
            throw new common_1.BadRequestException('Tracking not active for this order');
        }
        const connectionData = this.activeConnections.get(socketId);
        if (connectionData) {
            connectionData.lastActivity = new Date();
        }
        if (!orderId) {
            throw new common_1.BadRequestException('Order ID is required');
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
        await this.prisma.order.update({
            where: { bookingId: orderId },
            data: {
                providerLocation: { lat: latitude, lng: longitude }
            }
        });
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
    async getCurrentLocation(orderId, userId) {
        const order = await this.prisma.order.findFirst({
            where: {
                bookingId: orderId,
                userId: userId
            }
        });
        if (!order) {
            throw new common_1.NotFoundException('Order not found or not accessible');
        }
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
    async getLocationHistory(orderId, userId, limit = 50) {
        const order = await this.prisma.order.findFirst({
            where: {
                bookingId: orderId,
                userId: userId
            }
        });
        if (!order) {
            throw new common_1.NotFoundException('Order not found or not accessible');
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
    async calculateDistance(lat1, lng1, lat2, lng2) {
        const R = 6371;
        const dLat = this.toRadians(lat2 - lat1);
        const dLng = this.toRadians(lng2 - lng1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
                Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        return distance;
    }
    async estimateArrivalTime(orderId, userId) {
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
            throw new common_1.NotFoundException('Order not found');
        }
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
        const userLat = 0;
        const userLng = 0;
        if (userLat === 0 && userLng === 0) {
            return null;
        }
        const distance = await this.calculateDistance(Number(latestLocation.latitude), Number(latestLocation.longitude), userLat, userLng);
        const averageSpeed = 30;
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
    toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }
    async cleanupInactiveConnections() {
        const now = new Date();
        const inactiveThreshold = 5 * 60 * 1000;
        for (const [socketId, connection] of this.activeConnections.entries()) {
            const timeSinceLastActivity = now.getTime() - connection.lastActivity.getTime();
            if (timeSinceLastActivity > inactiveThreshold) {
                this.activeConnections.delete(socketId);
                this.activeTracking.delete(connection.orderId);
                this.logger.log(`Cleaned up inactive connection for order ${connection.orderId}`);
            }
        }
    }
};
exports.LocationTrackingService = LocationTrackingService;
exports.LocationTrackingService = LocationTrackingService = LocationTrackingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LocationTrackingService);
//# sourceMappingURL=location-tracking.service.js.map
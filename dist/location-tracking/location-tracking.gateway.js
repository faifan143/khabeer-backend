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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var LocationTrackingGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocationTrackingGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const location_tracking_service_1 = require("./location-tracking.service");
const location_update_dto_1 = require("./dto/location-update.dto");
const jwt_1 = require("@nestjs/jwt");
let LocationTrackingGateway = LocationTrackingGateway_1 = class LocationTrackingGateway {
    locationTrackingService;
    jwtService;
    server;
    logger = new common_1.Logger(LocationTrackingGateway_1.name);
    userSockets = new Map();
    providerSockets = new Map();
    constructor(locationTrackingService, jwtService) {
        this.locationTrackingService = locationTrackingService;
        this.jwtService = jwtService;
    }
    afterInit(server) {
        this.logger.log('Location tracking WebSocket gateway initialized');
        setInterval(() => {
            this.locationTrackingService.cleanupInactiveConnections();
        }, 60000);
    }
    async handleConnection(client) {
        try {
            const token = client.handshake.auth.token || client.handshake.query.token;
            if (!token) {
                client.disconnect();
                return;
            }
            const payload = this.jwtService.verify(token);
            const userId = payload.userId;
            const userRole = payload.role;
            if (userRole === 'PROVIDER') {
                this.providerSockets.set(userId, client.id);
                this.logger.log(`Provider ${userId} connected with socket ${client.id}`);
            }
            else {
                this.userSockets.set(userId, client.id);
                this.logger.log(`User ${userId} connected with socket ${client.id}`);
            }
            client.data.userId = userId;
            client.data.userRole = userRole;
            client.join(`user_${userId}`);
            client.emit('connected', {
                success: true,
                message: 'Connected to location tracking service',
                userId,
                userRole
            });
        }
        catch (error) {
            this.logger.error('Connection authentication failed:', error.message);
            client.disconnect();
        }
    }
    handleDisconnect(client) {
        const userId = client.data?.userId;
        const userRole = client.data?.userRole;
        if (userRole === 'PROVIDER') {
            this.providerSockets.delete(userId);
            this.logger.log(`Provider ${userId} disconnected`);
        }
        else {
            this.userSockets.delete(userId);
            this.logger.log(`User ${userId} disconnected`);
        }
        this.locationTrackingService.cleanupInactiveConnections();
    }
    async handleStartTracking(data, client) {
        try {
            const providerId = client.data?.userId;
            const userRole = client.data?.userRole;
            if (userRole !== 'PROVIDER') {
                client.emit('error', { message: 'Only providers can start tracking' });
                return;
            }
            const result = await this.locationTrackingService.startTracking(providerId, data, client.id);
            client.join(`order_${data.orderId}`);
            client.emit('tracking_started', result);
            const trackingData = this.locationTrackingService.getActiveTracking().find(t => t.orderId === data.orderId);
            if (trackingData) {
                this.server.to(`user_${trackingData.userId}`).emit('provider_tracking_started', {
                    orderId: data.orderId,
                    providerId: providerId,
                    message: 'Provider has started location tracking'
                });
            }
        }
        catch (error) {
            this.logger.error('Error starting tracking:', error.message);
            client.emit('error', { message: error.message });
        }
    }
    async handleStopTracking(data, client) {
        try {
            const providerId = client.data?.userId;
            const userRole = client.data?.userRole;
            if (userRole !== 'PROVIDER') {
                client.emit('error', { message: 'Only providers can stop tracking' });
                return;
            }
            const result = await this.locationTrackingService.stopTracking(providerId, data, client.id);
            client.leave(`order_${data.orderId}`);
            client.emit('tracking_stopped', result);
            const trackingData = this.locationTrackingService.getActiveTracking().find(t => t.orderId === data.orderId);
            if (trackingData) {
                this.server.to(`user_${trackingData.userId}`).emit('provider_tracking_stopped', {
                    orderId: data.orderId,
                    providerId: providerId,
                    message: 'Provider has stopped location tracking'
                });
            }
        }
        catch (error) {
            this.logger.error('Error stopping tracking:', error.message);
            client.emit('error', { message: error.message });
        }
    }
    async handleLocationUpdate(data, client) {
        try {
            const providerId = client.data?.userId;
            const userRole = client.data?.userRole;
            if (userRole !== 'PROVIDER') {
                client.emit('error', { message: 'Only providers can update location' });
                return;
            }
            const result = await this.locationTrackingService.updateLocation(providerId, data, client.id);
            client.emit('location_updated', result);
            const trackingData = this.locationTrackingService.getActiveTracking().find(t => t.orderId === data.orderId);
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
        }
        catch (error) {
            this.logger.error('Error updating location:', error.message);
            client.emit('error', { message: error.message });
        }
    }
    async handleTrackOrder(data, client) {
        try {
            const userId = client.data?.userId;
            const userRole = client.data?.userRole;
            if (userRole !== 'USER') {
                client.emit('error', { message: 'Only users can track orders' });
                return;
            }
            client.join(`order_${data.orderId}`);
            const currentLocation = await this.locationTrackingService.getCurrentLocation(data.orderId, userId);
            client.emit('order_tracking_started', {
                orderId: data.orderId,
                currentLocation,
                message: 'Started tracking order location'
            });
        }
        catch (error) {
            this.logger.error('Error tracking order:', error.message);
            client.emit('error', { message: error.message });
        }
    }
    async handleStopTrackingOrder(data, client) {
        try {
            const userId = client.data?.userId;
            const userRole = client.data?.userRole;
            if (userRole !== 'USER') {
                client.emit('error', { message: 'Only users can stop tracking orders' });
                return;
            }
            client.leave(`order_${data.orderId}`);
            client.emit('order_tracking_stopped', {
                orderId: data.orderId,
                message: 'Stopped tracking order location'
            });
        }
        catch (error) {
            this.logger.error('Error stopping order tracking:', error.message);
            client.emit('error', { message: error.message });
        }
    }
    async handleGetCurrentLocation(data, client) {
        try {
            const userId = client.data?.userId;
            const userRole = client.data?.userRole;
            if (userRole !== 'USER') {
                client.emit('error', { message: 'Only users can get location' });
                return;
            }
            const currentLocation = await this.locationTrackingService.getCurrentLocation(data.orderId, userId);
            client.emit('current_location', {
                orderId: data.orderId,
                ...currentLocation
            });
        }
        catch (error) {
            this.logger.error('Error getting current location:', error.message);
            client.emit('error', { message: error.message });
        }
    }
    async handleGetLocationHistory(data, client) {
        try {
            const userId = client.data?.userId;
            const userRole = client.data?.userRole;
            if (userRole !== 'USER') {
                client.emit('error', { message: 'Only users can get location history' });
                return;
            }
            const history = await this.locationTrackingService.getLocationHistory(data.orderId, userId, data.limit || 50);
            client.emit('location_history', {
                orderId: data.orderId,
                ...history
            });
        }
        catch (error) {
            this.logger.error('Error getting location history:', error.message);
            client.emit('error', { message: error.message });
        }
    }
    async handleGetEstimatedArrival(data, client) {
        try {
            const userId = client.data?.userId;
            const userRole = client.data?.userRole;
            if (userRole !== 'USER') {
                client.emit('error', { message: 'Only users can get estimated arrival' });
                return;
            }
            const estimatedTime = await this.locationTrackingService.estimateArrivalTime(data.orderId, userId);
            client.emit('estimated_arrival', {
                orderId: data.orderId,
                estimatedTimeMinutes: estimatedTime,
                message: estimatedTime ? `Estimated arrival in ${estimatedTime} minutes` : 'Unable to estimate arrival time'
            });
        }
        catch (error) {
            this.logger.error('Error getting estimated arrival:', error.message);
            client.emit('error', { message: error.message });
        }
    }
    async handleGetActiveTracking(client) {
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
        }
        catch (error) {
            this.logger.error('Error getting active tracking status:', error.message);
            client.emit('error', { message: error.message });
        }
    }
};
exports.LocationTrackingGateway = LocationTrackingGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], LocationTrackingGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('start_tracking'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [location_update_dto_1.StartTrackingDto,
        socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], LocationTrackingGateway.prototype, "handleStartTracking", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('stop_tracking'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [location_update_dto_1.StopTrackingDto,
        socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], LocationTrackingGateway.prototype, "handleStopTracking", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('update_location'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [location_update_dto_1.LocationUpdateDto,
        socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], LocationTrackingGateway.prototype, "handleLocationUpdate", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('track_order'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [location_update_dto_1.TrackOrderDto,
        socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], LocationTrackingGateway.prototype, "handleTrackOrder", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('stop_tracking_order'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [location_update_dto_1.TrackOrderDto,
        socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], LocationTrackingGateway.prototype, "handleStopTrackingOrder", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('get_current_location'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [location_update_dto_1.TrackOrderDto,
        socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], LocationTrackingGateway.prototype, "handleGetCurrentLocation", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('get_location_history'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], LocationTrackingGateway.prototype, "handleGetLocationHistory", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('get_estimated_arrival'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [location_update_dto_1.TrackOrderDto,
        socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], LocationTrackingGateway.prototype, "handleGetEstimatedArrival", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('get_active_tracking'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], LocationTrackingGateway.prototype, "handleGetActiveTracking", null);
exports.LocationTrackingGateway = LocationTrackingGateway = LocationTrackingGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        },
        namespace: '/location-tracking'
    }),
    __metadata("design:paramtypes", [location_tracking_service_1.LocationTrackingService,
        jwt_1.JwtService])
], LocationTrackingGateway);
//# sourceMappingURL=location-tracking.gateway.js.map
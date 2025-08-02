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
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocationTrackingController = void 0;
const common_1 = require("@nestjs/common");
const location_tracking_service_1 = require("./location-tracking.service");
const location_update_dto_1 = require("./dto/location-update.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
let LocationTrackingController = class LocationTrackingController {
    locationTrackingService;
    constructor(locationTrackingService) {
        this.locationTrackingService = locationTrackingService;
    }
    async startTracking(startTrackingDto, req) {
        return {
            message: 'Please use WebSocket connection to start tracking',
            endpoint: 'ws://localhost:3000/location-tracking',
            event: 'start_tracking',
            data: startTrackingDto
        };
    }
    async stopTracking(stopTrackingDto, req) {
        return {
            message: 'Please use WebSocket connection to stop tracking',
            endpoint: 'ws://localhost:3000/location-tracking',
            event: 'stop_tracking',
            data: stopTrackingDto
        };
    }
    async getCurrentLocation(orderId, req) {
        return this.locationTrackingService.getCurrentLocation(orderId, req.user.userId);
    }
    async getLocationHistory(orderId, limit = 50, req) {
        return this.locationTrackingService.getLocationHistory(orderId, req.user.userId, limit || 50);
    }
    async getEstimatedArrival(orderId, req) {
        const estimatedTime = await this.locationTrackingService.estimateArrivalTime(orderId, req.user.userId);
        return {
            orderId,
            estimatedTimeMinutes: estimatedTime,
            message: estimatedTime
                ? `Estimated arrival in ${estimatedTime} minutes`
                : 'Unable to estimate arrival time'
        };
    }
    async getActiveTracking() {
        return {
            activeTracking: this.locationTrackingService.getActiveTracking(),
            activeConnections: this.locationTrackingService.getActiveConnections()
        };
    }
    async getTrackingStatus(orderId, req) {
        const currentLocation = await this.locationTrackingService.getCurrentLocation(orderId, req.user.userId);
        const isTracking = currentLocation.isTracking;
        return {
            orderId,
            isTracking,
            hasLocationData: currentLocation.success,
            lastUpdate: currentLocation.success && currentLocation.location ? currentLocation.location.timestamp : null
        };
    }
    async getProviderOrders(providerId, req) {
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
    async getUserOrders(userId, req) {
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
};
exports.LocationTrackingController = LocationTrackingController;
__decorate([
    (0, common_1.Post)('start'),
    (0, roles_decorator_1.Roles)('PROVIDER'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [location_update_dto_1.StartTrackingDto, Object]),
    __metadata("design:returntype", Promise)
], LocationTrackingController.prototype, "startTracking", null);
__decorate([
    (0, common_1.Post)('stop'),
    (0, roles_decorator_1.Roles)('PROVIDER'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [location_update_dto_1.StopTrackingDto, Object]),
    __metadata("design:returntype", Promise)
], LocationTrackingController.prototype, "stopTracking", null);
__decorate([
    (0, common_1.Get)('order/:orderId/current-location'),
    (0, roles_decorator_1.Roles)('USER'),
    __param(0, (0, common_1.Param)('orderId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LocationTrackingController.prototype, "getCurrentLocation", null);
__decorate([
    (0, common_1.Get)('order/:orderId/location-history'),
    (0, roles_decorator_1.Roles)('USER'),
    __param(0, (0, common_1.Param)('orderId')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Object]),
    __metadata("design:returntype", Promise)
], LocationTrackingController.prototype, "getLocationHistory", null);
__decorate([
    (0, common_1.Get)('order/:orderId/estimated-arrival'),
    (0, roles_decorator_1.Roles)('USER'),
    __param(0, (0, common_1.Param)('orderId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LocationTrackingController.prototype, "getEstimatedArrival", null);
__decorate([
    (0, common_1.Get)('active-tracking'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LocationTrackingController.prototype, "getActiveTracking", null);
__decorate([
    (0, common_1.Get)('order/:orderId/tracking-status'),
    (0, roles_decorator_1.Roles)('USER', 'PROVIDER'),
    __param(0, (0, common_1.Param)('orderId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LocationTrackingController.prototype, "getTrackingStatus", null);
__decorate([
    (0, common_1.Get)('provider/:providerId/orders'),
    (0, roles_decorator_1.Roles)('PROVIDER'),
    __param(0, (0, common_1.Param)('providerId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], LocationTrackingController.prototype, "getProviderOrders", null);
__decorate([
    (0, common_1.Get)('user/:userId/orders'),
    (0, roles_decorator_1.Roles)('USER'),
    __param(0, (0, common_1.Param)('userId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], LocationTrackingController.prototype, "getUserOrders", null);
__decorate([
    (0, common_1.Get)('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LocationTrackingController.prototype, "getHealth", null);
exports.LocationTrackingController = LocationTrackingController = __decorate([
    (0, common_1.Controller)('location-tracking'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [location_tracking_service_1.LocationTrackingService])
], LocationTrackingController);
//# sourceMappingURL=location-tracking.controller.js.map
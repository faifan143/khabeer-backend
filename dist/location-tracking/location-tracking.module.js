"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocationTrackingModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const location_tracking_gateway_1 = require("./location-tracking.gateway");
const location_tracking_service_1 = require("./location-tracking.service");
const location_tracking_controller_1 = require("./location-tracking.controller");
const prisma_module_1 = require("../prisma/prisma.module");
let LocationTrackingModule = class LocationTrackingModule {
};
exports.LocationTrackingModule = LocationTrackingModule;
exports.LocationTrackingModule = LocationTrackingModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            jwt_1.JwtModule.register({
                secret: process.env.JWT_SECRET || 'your-secret-key',
                signOptions: { expiresIn: '24h' },
            }),
        ],
        controllers: [location_tracking_controller_1.LocationTrackingController],
        providers: [location_tracking_gateway_1.LocationTrackingGateway, location_tracking_service_1.LocationTrackingService],
        exports: [location_tracking_service_1.LocationTrackingService],
    })
], LocationTrackingModule);
//# sourceMappingURL=location-tracking.module.js.map
import { PrismaService } from '../prisma/prisma.service';
import { LocationUpdateDto, StartTrackingDto, StopTrackingDto } from './dto/location-update.dto';
export declare class LocationTrackingService {
    private readonly prisma;
    private readonly logger;
    private activeConnections;
    private activeTracking;
    constructor(prisma: PrismaService);
    startTracking(providerId: number, startTrackingDto: StartTrackingDto, socketId: string): Promise<{
        success: boolean;
        orderId: string;
        updateInterval: number;
        message: string;
    }>;
    stopTracking(providerId: number, stopTrackingDto: StopTrackingDto, socketId: string): Promise<{
        success: boolean;
        orderId: string;
        message: string;
    }>;
    updateLocation(providerId: number, locationUpdateDto: LocationUpdateDto, socketId: string): Promise<{
        success: boolean;
        locationId: number;
        timestamp: Date;
    }>;
    getCurrentLocation(orderId: string, userId: number): Promise<{
        success: boolean;
        message: string;
        isTracking: boolean;
        location?: undefined;
        providerId?: undefined;
    } | {
        success: boolean;
        location: {
            latitude: import("generated/prisma/runtime/library").Decimal;
            longitude: import("generated/prisma/runtime/library").Decimal;
            accuracy: import("generated/prisma/runtime/library").Decimal | null;
            timestamp: Date;
        };
        isTracking: boolean;
        providerId: number;
        message?: undefined;
    }>;
    getLocationHistory(orderId: string, userId: number, limit?: number): Promise<{
        success: boolean;
        locations: {
            latitude: import("generated/prisma/runtime/library").Decimal;
            longitude: import("generated/prisma/runtime/library").Decimal;
            accuracy: import("generated/prisma/runtime/library").Decimal | null;
            timestamp: Date;
        }[];
    }>;
    calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): Promise<number>;
    estimateArrivalTime(orderId: string, userId: number): Promise<number | null>;
    getActiveTracking(): {
        orderId: string;
        providerId: any;
        userId: any;
        startedAt: any;
        lastLocation: any;
    }[];
    getActiveConnections(): {
        socketId: string;
        providerId: any;
        orderId: any;
        connectedAt: any;
        lastActivity: any;
    }[];
    private toRadians;
    cleanupInactiveConnections(): Promise<void>;
}

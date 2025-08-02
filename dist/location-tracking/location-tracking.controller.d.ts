import { LocationTrackingService } from './location-tracking.service';
import { StartTrackingDto, StopTrackingDto } from './dto/location-update.dto';
export declare class LocationTrackingController {
    private readonly locationTrackingService;
    constructor(locationTrackingService: LocationTrackingService);
    startTracking(startTrackingDto: StartTrackingDto, req: any): Promise<{
        message: string;
        endpoint: string;
        event: string;
        data: StartTrackingDto;
    }>;
    stopTracking(stopTrackingDto: StopTrackingDto, req: any): Promise<{
        message: string;
        endpoint: string;
        event: string;
        data: StopTrackingDto;
    }>;
    getCurrentLocation(orderId: string, req: any): Promise<{
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
    getLocationHistory(orderId: string, limit: number | undefined, req: any): Promise<{
        success: boolean;
        locations: {
            latitude: import("generated/prisma/runtime/library").Decimal;
            longitude: import("generated/prisma/runtime/library").Decimal;
            accuracy: import("generated/prisma/runtime/library").Decimal | null;
            timestamp: Date;
        }[];
    }>;
    getEstimatedArrival(orderId: string, req: any): Promise<{
        orderId: string;
        estimatedTimeMinutes: number | null;
        message: string;
    }>;
    getActiveTracking(): Promise<{
        activeTracking: {
            orderId: string;
            providerId: any;
            userId: any;
            startedAt: any;
            lastLocation: any;
        }[];
        activeConnections: {
            socketId: string;
            providerId: any;
            orderId: any;
            connectedAt: any;
            lastActivity: any;
        }[];
    }>;
    getTrackingStatus(orderId: string, req: any): Promise<{
        orderId: string;
        isTracking: boolean;
        hasLocationData: boolean;
        lastUpdate: Date | null;
    }>;
    getProviderOrders(providerId: number, req: any): Promise<{
        providerId: number;
        activeOrders: {
            orderId: string;
            startedAt: any;
            lastLocation: any;
        }[];
    }>;
    getUserOrders(userId: number, req: any): Promise<{
        userId: number;
        trackedOrders: {
            orderId: string;
            providerId: any;
            startedAt: any;
            lastLocation: any;
        }[];
    }>;
    getHealth(): Promise<{
        status: string;
        activeTrackingCount: number;
        activeConnectionsCount: number;
        timestamp: string;
    }>;
}

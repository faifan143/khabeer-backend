import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { LocationTrackingService } from './location-tracking.service';
import { LocationUpdateDto, StartTrackingDto, StopTrackingDto, TrackOrderDto } from './dto/location-update.dto';
import { JwtService } from '@nestjs/jwt';
export declare class LocationTrackingGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private readonly locationTrackingService;
    private readonly jwtService;
    server: Server;
    private readonly logger;
    private userSockets;
    private providerSockets;
    constructor(locationTrackingService: LocationTrackingService, jwtService: JwtService);
    afterInit(server: Server): void;
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): void;
    handleStartTracking(data: StartTrackingDto, client: Socket): Promise<void>;
    handleStopTracking(data: StopTrackingDto, client: Socket): Promise<void>;
    handleLocationUpdate(data: LocationUpdateDto, client: Socket): Promise<void>;
    handleTrackOrder(data: TrackOrderDto, client: Socket): Promise<void>;
    handleStopTrackingOrder(data: TrackOrderDto, client: Socket): Promise<void>;
    handleGetCurrentLocation(data: TrackOrderDto, client: Socket): Promise<void>;
    handleGetLocationHistory(data: {
        orderId: string;
        limit?: number;
    }, client: Socket): Promise<void>;
    handleGetEstimatedArrival(data: TrackOrderDto, client: Socket): Promise<void>;
    handleGetActiveTracking(client: Socket): Promise<void>;
}

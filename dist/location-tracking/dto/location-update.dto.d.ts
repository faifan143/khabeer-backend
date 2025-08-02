export declare class LocationUpdateDto {
    latitude: number;
    longitude: number;
    accuracy?: number;
    orderId?: string;
    isActive?: boolean;
}
export declare class StartTrackingDto {
    orderId: string;
    updateInterval?: number;
}
export declare class StopTrackingDto {
    orderId: string;
}
export declare class TrackOrderDto {
    orderId: string;
}
export interface LocationData {
    latitude: number;
    longitude: number;
    accuracy?: number;
    timestamp: Date;
    providerId: number;
    orderId: string;
}

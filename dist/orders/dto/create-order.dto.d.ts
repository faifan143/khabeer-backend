export declare enum OrderLocation {
    HOME = "Home",
    WORK = "Work",
    OTHER = "Other"
}
export declare class CreateOrderDto {
    providerId: number;
    serviceId: number;
    scheduledDate?: string;
    location?: OrderLocation;
    locationDetails?: string;
    quantity?: number;
    providerLocation?: {
        lat: number;
        lng: number;
    };
}

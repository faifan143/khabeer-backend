export declare enum OrderStatus {
    PENDING = "pending",
    ACCEPTED = "accepted",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    CANCELLED = "cancelled"
}
export declare class UpdateOrderStatusDto {
    status: OrderStatus;
    notes?: string;
    providerLocation?: {
        lat: number;
        lng: number;
    };
}

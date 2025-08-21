export declare class ProviderOrderResponseDto {
    id: number;
    status: string;
    orderDate: Date;
    scheduledDate?: Date;
    location?: string;
    locationDetails?: string;
    quantity: number;
    totalAmount: number;
    providerAmount: number;
    commissionAmount: number;
    bookingId: string;
    user: {
        id: number;
        name: string;
        email: string;
        phone: string;
        latitude: number | null;
        longitude: number | null;
    };
    service: {
        id: number;
        title: string;
        description: string;
    };
}
export declare class ProviderOrdersResponseDto {
    orders: ProviderOrderResponseDto[];
    total: number;
    status: string;
}

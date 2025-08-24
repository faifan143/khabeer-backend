export class ProviderOrderResponseDto {
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
    isMultipleServices: boolean;
    services: Array<{
        serviceId: number;
        serviceTitle: string;
        serviceDescription: string;
        serviceImage: string;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
        commission: number;
        commissionAmount: number;
    }>;
    user: {
        id: number;
        name: string;
        email: string;
        phone: string;
        image: string;
        state: string;
        latitude: number | null;
        longitude: number | null;
    };
    service: {
        id: number;
        title: string;
        description: string;
        image: string;
        category?: {
            id: number;
            image: string;
            titleAr: string;
            titleEn: string;
            state: string;
        };
    };
    // Duration is now the scheduled date
    duration?: Date;
}

export class ProviderOrdersResponseDto {
    orders: ProviderOrderResponseDto[];
    total: number;
    status: string;
}

export class OrderServiceItemResponseDto {
    serviceId: number;
    serviceTitle: string;
    serviceDescription: string;
    serviceImage: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    commission: number;
    commissionAmount: number;
}

export class OrderMultipleServicesResponseDto {
    id: number;
    bookingId: string;
    userId: number;
    providerId: number;
    status: string;
    orderDate: Date;
    scheduledDate?: Date;
    location?: string;
    locationDetails?: string;
    userLocation?: {
        latitude: number;
        longitude: number;
        address?: string;
    };
    notes?: string;

    // Services breakdown
    services: OrderServiceItemResponseDto[];

    // Financial summary
    subtotal: number;
    totalCommission: number;
    totalAmount: number;

    // Applied offers
    appliedOffers?: Array<{
        serviceId: number;
        originalPrice: number;
        offerPrice: number;
        discount: number;
        savings: number;
    }>;

    // Provider and user info
    provider: {
        id: number;
        name: string;
        phone: string;
        image: string;
    };
    user: {
        id: number;
        name: string;
        phone: string;
        email?: string;
    };
}

export class ProviderServiceDetailDto {
    id: number;
    price: number;
    isActive: boolean;
    service: {
        id: number;
        title: string;
        description: string | null;
        image: string;
        commission: number | null;
        categoryId: number;
    };
}

export class ProviderOfferDto {
    id: number;
    startDate: Date;
    endDate: Date;
    description: string;
    isActive: boolean;
    offerPrice: number;
    originalPrice: number;
    service: {
        id: number;
        title: string;
        description: string | null;
    };
}

export class ProviderRatingDto {
    id: number;
    rating: number;
    comment?: string | null;
    ratingDate: Date;
    orderId?: number | null;
    user: {
        id: number;
        name: string;
        email?: string | null;
        phone: string;
    };
}

export class ProviderOrderDto {
    id: number;
    status: string;
    orderDate: Date;
    scheduledDate?: Date | null;
    location?: string | null;
    locationDetails?: string | null;
    quantity: number;
    totalAmount: number;
    providerAmount: number;
    commissionAmount: number;
    bookingId: string;
    user: {
        id: number;
        name: string;
        email?: string | null;
        phone: string;
        latitude?: number | null;
        longitude?: number | null;
    };
    service: {
        id: number;
        title: string;
        description: string | null;
    };
}

export class ProviderVerificationDto {
    id: string;
    status: string;
    documents: string[];
    adminNotes?: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export class ProviderJoinRequestDto {
    id: number;
    requestDate: Date;
    status: string;
    adminNotes?: string | null;
}

export class ProviderFullDetailsDto {
    // Basic provider information
    id: number;
    name: string;
    email?: string | null;
    image: string;
    description: string;
    state: string;
    phone: string;
    isActive: boolean;
    isVerified: boolean;
    location?: any;
    officialDocuments?: string | null;
    createdAt: Date;
    updatedAt: Date;
    fcm?: string | null;

    // Related services
    providerServices: ProviderServiceDetailDto[];

    // Offers
    offers: ProviderOfferDto[];

    // Ratings and reviews
    ratings: ProviderRatingDto[];
    averageRating: number;
    totalRatings: number;

    // Orders
    orders: ProviderOrderDto[];
    totalOrders: number;
    completedOrders: number;
    pendingOrders: number;

    // Verification and join request
    verification?: ProviderVerificationDto;
    joinRequest?: ProviderJoinRequestDto;

    // Statistics
    totalEarnings: number;
    totalCommission: number;
}

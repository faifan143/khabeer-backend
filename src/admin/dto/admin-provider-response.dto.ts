export class AdminProviderServiceDto {
    id: number;
    price: number;
    isActive: boolean;
    service: {
        id: number;
        title: string;
        description: string;
        image: string;
        commission: number | null;
        category: {
            id: number;
            titleEn: string;
            titleAr: string;
            image: string;
            state: string;
        };
    };
}

export class AdminProviderOfferDto {
    id: number;
    originalPrice: number;
    offerPrice: number;
}

export class AdminProviderResponseDto {
    // Basic provider information
    id: number;
    name: string;
    email?: string | null;
    phone: string;
    description: string;
    image: string;
    state: string;
    isActive: boolean;
    isVerified: boolean;
    createdAt: Date;
    updatedAt: Date;

    // Commission information
    totalCommission: number;

    // Related services
    providerServices: AdminProviderServiceDto[];

    // Active offers
    offers: AdminProviderOfferDto[];

    // Counts
    _count: {
        orders: number;
        providerServices: number;
        ratings: number;
    };
}

export class AdminProvidersResponseDto {
    providers: AdminProviderResponseDto[];
    total: number;
}

export class TopProviderDto {
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
    createdAt: Date;
    updatedAt: Date;

    // Performance metrics
    averageRating: number;
    totalRatings: number;
    totalOrders: number;
    completedOrders: number;
    totalRevenue: number;
    activeServices: number;

    // Service information
    services: {
        id: number;
        title: string;
        description: string;
        price: number;
        category: {
            id: number;
            titleEn: string;
            titleAr: string;
        };
    }[];

    // Ranking information
    rank: number;
    tier: 'top-rated' | 'active' | 'verified' | 'new';
    score: number; // Calculated score for ranking
}

export class TopProvidersResponseDto {
    providers: TopProviderDto[];
    total: number;
    summary: {
        topRated: number;
        active: number;
        verified: number;
        new: number;
    };
    filters: {
        limit: number;
        minRating?: number;
        minOrders?: number;
        includeUnrated: boolean;
    };
}

export declare class ProviderServiceInfoDto {
    price: number;
    isActive: boolean;
    offerPrice: number | null;
}
export declare class ProviderByServiceDto {
    id: number;
    name: string;
    image: string;
    description: string;
    state: string;
    phone: string;
    location: any;
    isActive: boolean;
    isVerified: boolean;
    createdAt: Date;
    providerServices: ProviderServiceInfoDto[];
    averageRating: number;
    totalRatings: number;
}
export declare class ProvidersByServiceResponseDto {
    providers: ProviderByServiceDto[];
    total: number;
    serviceId: number;
}

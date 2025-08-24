export class CategoryServiceByProviderDto {
    id: number;
    title: string;
    description: string;
    image: string;
    commission: number;
    categoryId: number;
    providerService: {
        id: number;
        price: number;
        isActive: boolean;
    };
}

export class CategoryServicesByProviderResponseDto {
    categoryId: number;
    categoryName: string;
    providerId: number;
    providerName: string;
    services: CategoryServiceByProviderDto[];
    total: number;
}

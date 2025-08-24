import { OffersService, CreateOfferDto, UpdateOfferDto } from './offers.service';
export declare class OffersController {
    private readonly offersService;
    constructor(offersService: OffersService);
    create(createOfferDto: CreateOfferDto, req: any): Promise<{
        service: {
            description: string;
            id: number;
            image: string;
            title: string;
        };
        provider: {
            id: number;
            name: string;
            image: string;
        };
    } & {
        serviceId: number;
        startDate: Date;
        endDate: Date;
        originalPrice: number;
        offerPrice: number;
        description: string;
        id: number;
        isActive: boolean;
        providerId: number;
    }>;
    findAll(providerId?: string, serviceId?: string, activeOnly?: string): Promise<({
        service: {
            description: string;
            id: number;
            image: string;
            title: string;
        };
        provider: {
            id: number;
            name: string;
            image: string;
            isVerified: boolean;
        };
    } & {
        serviceId: number;
        startDate: Date;
        endDate: Date;
        originalPrice: number;
        offerPrice: number;
        description: string;
        id: number;
        isActive: boolean;
        providerId: number;
    })[]>;
    getActiveOffers(limit?: string): Promise<({
        service: {
            description: string;
            id: number;
            image: string;
            title: string;
        };
        provider: {
            id: number;
            name: string;
            image: string;
            isVerified: boolean;
        };
    } & {
        serviceId: number;
        startDate: Date;
        endDate: Date;
        originalPrice: number;
        offerPrice: number;
        description: string;
        id: number;
        isActive: boolean;
        providerId: number;
    })[]>;
    getAvailableOffers(limit?: string): Promise<({
        service: {
            description: string;
            id: number;
            image: string;
            title: string;
        };
        provider: {
            id: number;
            name: string;
            image: string;
            isActive: boolean;
            isVerified: boolean;
        };
    } & {
        serviceId: number;
        startDate: Date;
        endDate: Date;
        originalPrice: number;
        offerPrice: number;
        description: string;
        id: number;
        isActive: boolean;
        providerId: number;
    })[]>;
    debugAllOffers(): Promise<{
        totalOffers: number;
        currentDate: string;
        offers: {
            id: number;
            providerId: number;
            serviceId: number;
            isActive: boolean;
            startDate: Date;
            endDate: Date;
            provider: {
                id: number;
                name: string;
                isVerified: boolean;
                isActive: boolean;
            };
            service: {
                id: number;
                title: string;
            };
            passesIsActive: boolean;
            passesStartDate: boolean;
            passesEndDate: boolean;
            passesProviderVerified: boolean;
            passesProviderActive: boolean;
            wouldBeVisible: boolean;
        }[];
    }>;
    debugActiveOffersCriteria(): Promise<{
        currentDate: string;
        criteria: {
            inactiveOffers: {
                count: number;
                offers: {
                    serviceId: number;
                    id: number;
                    providerId: number;
                }[];
            };
            futureStartOffers: {
                count: number;
                offers: {
                    serviceId: number;
                    startDate: Date;
                    id: number;
                    providerId: number;
                }[];
            };
            expiredOffers: {
                count: number;
                offers: {
                    serviceId: number;
                    endDate: Date;
                    id: number;
                    providerId: number;
                }[];
            };
            unverifiedProviderOffers: {
                count: number;
                offers: {
                    serviceId: number;
                    id: number;
                    providerId: number;
                }[];
            };
            inactiveProviderOffers: {
                count: number;
                offers: {
                    serviceId: number;
                    id: number;
                    providerId: number;
                }[];
            };
        };
    }>;
    getFlexibleActiveOffers(limit?: string): Promise<({
        service: {
            description: string;
            id: number;
            image: string;
            title: string;
        };
        provider: {
            id: number;
            name: string;
            image: string;
            isActive: boolean;
            isVerified: boolean;
        };
    } & {
        serviceId: number;
        startDate: Date;
        endDate: Date;
        originalPrice: number;
        offerPrice: number;
        description: string;
        id: number;
        isActive: boolean;
        providerId: number;
    })[]>;
    getProviderOffers(providerId: number): Promise<({
        service: {
            description: string;
            id: number;
            image: string;
            title: string;
        };
    } & {
        serviceId: number;
        startDate: Date;
        endDate: Date;
        originalPrice: number;
        offerPrice: number;
        description: string;
        id: number;
        isActive: boolean;
        providerId: number;
    })[]>;
    getMyOffers(req: any): Promise<({
        service: {
            description: string;
            id: number;
            image: string;
            title: string;
        };
    } & {
        serviceId: number;
        startDate: Date;
        endDate: Date;
        originalPrice: number;
        offerPrice: number;
        description: string;
        id: number;
        isActive: boolean;
        providerId: number;
    })[]>;
    findOne(id: number): Promise<{
        service: {
            description: string;
            id: number;
            image: string;
            title: string;
        };
        provider: {
            id: number;
            name: string;
            image: string;
            isVerified: boolean;
        };
    } & {
        serviceId: number;
        startDate: Date;
        endDate: Date;
        originalPrice: number;
        offerPrice: number;
        description: string;
        id: number;
        isActive: boolean;
        providerId: number;
    }>;
    update(id: number, updateOfferDto: UpdateOfferDto, req: any): Promise<{
        service: {
            description: string;
            id: number;
            image: string;
            title: string;
        };
        provider: {
            id: number;
            name: string;
            image: string;
        };
    } & {
        serviceId: number;
        startDate: Date;
        endDate: Date;
        originalPrice: number;
        offerPrice: number;
        description: string;
        id: number;
        isActive: boolean;
        providerId: number;
    }>;
    remove(id: number, req: any): Promise<{
        message: string;
    }>;
    deactivateExpiredOffers(): Promise<{
        message: string;
    }>;
}

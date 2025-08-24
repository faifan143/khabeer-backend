import { PrismaService } from '../prisma/prisma.service';
export interface CreateOfferDto {
    providerId: number;
    serviceId: number;
    startDate: Date;
    endDate: Date;
    originalPrice: number;
    offerPrice: number;
    description: string;
}
export interface UpdateOfferDto {
    startDate?: Date;
    endDate?: Date;
    originalPrice?: number;
    offerPrice?: number;
    description?: string;
    isActive?: boolean;
}
export declare class OffersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(providerId: number, createOfferDto: CreateOfferDto): Promise<{
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
    findAll(providerId?: number, serviceId?: number, activeOnly?: boolean): Promise<({
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
    update(id: number, providerId: number, updateOfferDto: UpdateOfferDto): Promise<{
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
    remove(id: number, providerId: number): Promise<{
        message: string;
    }>;
    getActiveOffers(limit?: number): Promise<({
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
    deactivateExpiredOffers(): Promise<{
        message: string;
    }>;
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
    getFlexibleActiveOffers(limit?: number): Promise<({
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
    getAvailableOffers(limit?: number): Promise<({
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
    debugSpecificOffer(id: number): Promise<{
        offer: any;
        provider: any;
        service: any;
        currentDate: any;
        filterChecks: any;
        wouldBeVisible: boolean;
        issues: string[];
    }>;
}

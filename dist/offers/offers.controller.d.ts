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

import { ProviderRatingsService, CreateRatingDto, UpdateRatingDto } from './provider-ratings.service';
export declare class ProviderRatingsController {
    private readonly providerRatingsService;
    constructor(providerRatingsService: ProviderRatingsService);
    create(createRatingDto: CreateRatingDto, req: any): Promise<{
        provider: {
            id: number;
            name: string;
            image: string;
        };
        user: {
            id: number;
            name: string;
            image: string;
        };
    } & {
        id: number;
        providerId: number;
        userId: number;
        orderId: number | null;
        rating: number;
        comment: string | null;
        ratingDate: Date;
    }>;
    findAll(providerId?: string): Promise<({
        provider: {
            id: number;
            name: string;
            image: string;
        };
        user: {
            id: number;
            name: string;
            image: string;
        };
    } & {
        id: number;
        providerId: number;
        userId: number;
        orderId: number | null;
        rating: number;
        comment: string | null;
        ratingDate: Date;
    })[]>;
    findByProvider(providerId: number): Promise<{
        provider: {
            id: number;
            name: string;
            image: string;
        };
        ratings: ({
            user: {
                id: number;
                name: string;
                image: string;
            };
        } & {
            id: number;
            providerId: number;
            userId: number;
            orderId: number | null;
            rating: number;
            comment: string | null;
            ratingDate: Date;
        })[];
        averageRating: number;
        totalRatings: number;
        ratingDistribution: {
            1: number;
            2: number;
            3: number;
            4: number;
            5: number;
        };
    }>;
    getTopRatedProviders(limit?: string): Promise<{
        averageRating: number;
        totalRatings: number;
        ratings: {
            rating: number;
        }[];
        description: string;
        id: number;
        name: string;
        email: string | null;
        password: string | null;
        image: string;
        state: string;
        phone: string;
        isActive: boolean;
        isVerified: boolean;
        location: import("generated/prisma/runtime/library").JsonValue | null;
        officialDocuments: string | null;
        fcmToken: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    getMyRatings(req: any): Promise<({
        provider: {
            id: number;
            name: string;
            image: string;
        };
    } & {
        id: number;
        providerId: number;
        userId: number;
        orderId: number | null;
        rating: number;
        comment: string | null;
        ratingDate: Date;
    })[]>;
    findOne(id: number): Promise<{
        provider: {
            id: number;
            name: string;
            image: string;
        };
        user: {
            id: number;
            name: string;
            image: string;
        };
    } & {
        id: number;
        providerId: number;
        userId: number;
        orderId: number | null;
        rating: number;
        comment: string | null;
        ratingDate: Date;
    }>;
    update(id: number, updateRatingDto: UpdateRatingDto, req: any): Promise<{
        provider: {
            id: number;
            name: string;
            image: string;
        };
        user: {
            id: number;
            name: string;
            image: string;
        };
    } & {
        id: number;
        providerId: number;
        userId: number;
        orderId: number | null;
        rating: number;
        comment: string | null;
        ratingDate: Date;
    }>;
    remove(id: number, req: any): Promise<{
        message: string;
    }>;
}

import { PrismaService } from '../prisma/prisma.service';
export interface CreateRatingDto {
    providerId: number;
    orderId?: number;
    rating: number;
    comment?: string;
}
export interface UpdateRatingDto {
    rating?: number;
    comment?: string;
}
export declare class ProviderRatingsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(userId: number, createRatingDto: CreateRatingDto): Promise<{
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
        orderId: number | null;
        rating: number;
        userId: number;
        comment: string | null;
        ratingDate: Date;
    }>;
    findAll(providerId?: number): Promise<({
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
        orderId: number | null;
        rating: number;
        userId: number;
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
            orderId: number | null;
            rating: number;
            userId: number;
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
        orderId: number | null;
        rating: number;
        userId: number;
        comment: string | null;
        ratingDate: Date;
    }>;
    update(id: number, userId: number, updateRatingDto: UpdateRatingDto): Promise<{
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
        orderId: number | null;
        rating: number;
        userId: number;
        comment: string | null;
        ratingDate: Date;
    }>;
    remove(id: number, userId: number): Promise<{
        message: string;
    }>;
    getUserRatings(userId: number): Promise<({
        provider: {
            id: number;
            name: string;
            image: string;
        };
    } & {
        id: number;
        providerId: number;
        orderId: number | null;
        rating: number;
        userId: number;
        comment: string | null;
        ratingDate: Date;
    })[]>;
    getTopRatedProviders(limit?: number): Promise<{
        averageRating: number;
        totalRatings: number;
        ratings: {
            rating: number;
        }[];
        description: string;
        id: number;
        name: string;
        image: string;
        state: string;
        phone: string;
        isActive: boolean;
        officialDocuments: string | null;
        isVerified: boolean;
        location: import("generated/prisma/runtime/library").JsonValue | null;
        createdAt: Date;
        email: string | null;
        updatedAt: Date;
        password: string | null;
        fcm: string | null;
    }[]>;
}

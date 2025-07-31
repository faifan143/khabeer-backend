import { PrismaService } from '../prisma/prisma.service';
export interface CreateJoinRequestDto {
    providerId: number;
    reason?: string;
    additionalInfo?: string;
}
export interface UpdateJoinRequestDto {
    status: 'pending' | 'approved' | 'rejected';
    adminNotes?: string;
}
export declare class ProviderJoinRequestsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(providerId: number, createJoinRequestDto: CreateJoinRequestDto): Promise<{
        provider: {
            description: string;
            id: number;
            name: string;
            email: string | null;
            image: string;
            phone: string;
            isActive: boolean;
            isVerified: boolean;
        };
    } & {
        id: number;
        providerId: number;
        status: string;
        requestDate: Date;
        adminNotes: string | null;
    }>;
    findAll(status?: string): Promise<({
        provider: {
            description: string;
            id: number;
            name: string;
            email: string | null;
            image: string;
            phone: string;
            isActive: boolean;
            isVerified: boolean;
        };
    } & {
        id: number;
        providerId: number;
        status: string;
        requestDate: Date;
        adminNotes: string | null;
    })[]>;
    findOne(id: number): Promise<{
        provider: {
            description: string;
            id: number;
            name: string;
            email: string | null;
            image: string;
            phone: string;
            isActive: boolean;
            isVerified: boolean;
        };
    } & {
        id: number;
        providerId: number;
        status: string;
        requestDate: Date;
        adminNotes: string | null;
    }>;
    findByProvider(providerId: number): Promise<({
        provider: {
            description: string;
            id: number;
            name: string;
            email: string | null;
            image: string;
            phone: string;
            isActive: boolean;
            isVerified: boolean;
        };
    } & {
        id: number;
        providerId: number;
        status: string;
        requestDate: Date;
        adminNotes: string | null;
    })[]>;
    update(id: number, updateJoinRequestDto: UpdateJoinRequestDto): Promise<{
        provider: {
            description: string;
            id: number;
            name: string;
            email: string | null;
            image: string;
            phone: string;
            isActive: boolean;
            isVerified: boolean;
        };
    } & {
        id: number;
        providerId: number;
        status: string;
        requestDate: Date;
        adminNotes: string | null;
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
    getPendingRequests(): Promise<({
        provider: {
            description: string;
            id: number;
            name: string;
            email: string | null;
            image: string;
            phone: string;
            isActive: boolean;
            isVerified: boolean;
        };
    } & {
        id: number;
        providerId: number;
        status: string;
        requestDate: Date;
        adminNotes: string | null;
    })[]>;
    getRequestStats(): Promise<{
        total: number;
        pending: number;
        approved: number;
        rejected: number;
        approvalRate: number;
    }>;
    approveRequest(id: number, adminNotes?: string): Promise<{
        provider: {
            description: string;
            id: number;
            name: string;
            email: string | null;
            image: string;
            phone: string;
            isActive: boolean;
            isVerified: boolean;
        };
    } & {
        id: number;
        providerId: number;
        status: string;
        requestDate: Date;
        adminNotes: string | null;
    }>;
    rejectRequest(id: number, adminNotes: string): Promise<{
        provider: {
            description: string;
            id: number;
            name: string;
            email: string | null;
            image: string;
            phone: string;
            isActive: boolean;
            isVerified: boolean;
        };
    } & {
        id: number;
        providerId: number;
        status: string;
        requestDate: Date;
        adminNotes: string | null;
    }>;
}

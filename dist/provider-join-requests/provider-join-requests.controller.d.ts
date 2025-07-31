import { ProviderJoinRequestsService, CreateJoinRequestDto, UpdateJoinRequestDto } from './provider-join-requests.service';
export declare class ProviderJoinRequestsController {
    private readonly providerJoinRequestsService;
    constructor(providerJoinRequestsService: ProviderJoinRequestsService);
    create(createJoinRequestDto: CreateJoinRequestDto, req: any): Promise<{
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
    getMyRequests(req: any): Promise<({
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
    getProviderRequests(providerId: number): Promise<({
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
    approveRequest(id: number, body: {
        adminNotes?: string;
    }): Promise<{
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
    rejectRequest(id: number, body: {
        adminNotes: string;
    }): Promise<{
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
}

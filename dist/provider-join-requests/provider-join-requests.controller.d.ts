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
        adminNotes: string | null;
        requestDate: Date;
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
        adminNotes: string | null;
        requestDate: Date;
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
        adminNotes: string | null;
        requestDate: Date;
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
        adminNotes: string | null;
        requestDate: Date;
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
        adminNotes: string | null;
        requestDate: Date;
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
        adminNotes: string | null;
        requestDate: Date;
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
        adminNotes: string | null;
        requestDate: Date;
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
        adminNotes: string | null;
        requestDate: Date;
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
        adminNotes: string | null;
        requestDate: Date;
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
}

import { ProviderVerificationService, CreateVerificationDto, UpdateVerificationDto } from './provider-verification.service';
export declare class ProviderVerificationController {
    private readonly providerVerificationService;
    constructor(providerVerificationService: ProviderVerificationService);
    create(createVerificationDto: CreateVerificationDto, req: any): Promise<{
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
        id: string;
        createdAt: Date;
        updatedAt: Date;
        providerId: number;
        documents: string[];
        status: string;
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
        id: string;
        createdAt: Date;
        updatedAt: Date;
        providerId: number;
        documents: string[];
        status: string;
        adminNotes: string | null;
    })[]>;
    getPendingVerifications(): Promise<({
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
        id: string;
        createdAt: Date;
        updatedAt: Date;
        providerId: number;
        documents: string[];
        status: string;
        adminNotes: string | null;
    })[]>;
    getVerificationStats(): Promise<{
        total: number;
        pending: number;
        approved: number;
        rejected: number;
        approvalRate: number;
    }>;
    getMyVerification(req: any): Promise<({
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
        id: string;
        createdAt: Date;
        updatedAt: Date;
        providerId: number;
        documents: string[];
        status: string;
        adminNotes: string | null;
    }) | null>;
    getProviderVerification(providerId: number): Promise<({
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
        id: string;
        createdAt: Date;
        updatedAt: Date;
        providerId: number;
        documents: string[];
        status: string;
        adminNotes: string | null;
    }) | null>;
    addDocumentsAdmin(providerId: number, body: {
        documents: string[];
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        providerId: number;
        documents: string[];
        status: string;
        adminNotes: string | null;
    }>;
    removeDocumentAdmin(providerId: number, body: {
        documentUrl: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        providerId: number;
        documents: string[];
        status: string;
        adminNotes: string | null;
    }>;
    approveVerificationAdmin(providerId: number, body: {
        adminNotes?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        providerId: number;
        documents: string[];
        status: string;
        adminNotes: string | null;
    }>;
    rejectVerificationAdmin(providerId: number, body: {
        adminNotes: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        providerId: number;
        documents: string[];
        status: string;
        adminNotes: string | null;
    }>;
    findOne(id: string): Promise<{
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
        id: string;
        createdAt: Date;
        updatedAt: Date;
        providerId: number;
        documents: string[];
        status: string;
        adminNotes: string | null;
    }>;
    update(id: string, updateVerificationDto: UpdateVerificationDto): Promise<{
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
        id: string;
        createdAt: Date;
        updatedAt: Date;
        providerId: number;
        documents: string[];
        status: string;
        adminNotes: string | null;
    }>;
    approveVerification(id: string, body: {
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
        id: string;
        createdAt: Date;
        updatedAt: Date;
        providerId: number;
        documents: string[];
        status: string;
        adminNotes: string | null;
    }>;
    rejectVerification(id: string, body: {
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
        id: string;
        createdAt: Date;
        updatedAt: Date;
        providerId: number;
        documents: string[];
        status: string;
        adminNotes: string | null;
    }>;
    addDocuments(id: string, body: {
        documents: string[];
    }, req: any): Promise<{
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
        id: string;
        createdAt: Date;
        updatedAt: Date;
        providerId: number;
        documents: string[];
        status: string;
        adminNotes: string | null;
    }>;
    removeDocument(id: string, body: {
        documentUrl: string;
    }, req: any): Promise<{
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
        id: string;
        createdAt: Date;
        updatedAt: Date;
        providerId: number;
        documents: string[];
        status: string;
        adminNotes: string | null;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}

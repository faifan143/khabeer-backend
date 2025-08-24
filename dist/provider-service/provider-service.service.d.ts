import { PrismaService } from '../prisma/prisma.service';
export interface CreateProviderServiceDto {
    serviceId: number;
    price: number;
    isActive?: boolean;
}
export interface UpdateProviderServiceDto {
    price?: number;
    isActive?: boolean;
}
export interface AddServicesDto {
    services: Array<{
        serviceId: number;
        price: number;
        isActive?: boolean;
    }>;
}
export interface ProviderServiceWithOfferResponse {
    id: number;
    providerId: number;
    serviceId: number;
    isActive: boolean;
    price: number;
    provider?: {
        id: number;
        name: string;
        image: string;
        isVerified?: boolean;
        isActive?: boolean;
    };
    service?: {
        id: number;
        title: string;
        description: string;
        image: string;
        commission: number;
    };
    activeOffer?: {
        id: number;
        startDate: Date;
        endDate: Date;
        description: string;
        offerPrice: number;
        originalPrice: number;
    } | null;
}
export declare class ProviderServiceService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private getActiveOffer;
    create(providerId: number, createProviderServiceDto: CreateProviderServiceDto): Promise<{
        service: {
            description: string;
            id: number;
            image: string;
            title: string;
            commission: number;
        };
    } & {
        serviceId: number;
        id: number;
        isActive: boolean;
        providerId: number;
        price: number;
    }>;
    findAll(providerId?: number, activeOnly?: boolean): Promise<ProviderServiceWithOfferResponse[]>;
    findByProvider(providerId: number, activeOnly?: boolean): Promise<ProviderServiceWithOfferResponse[]>;
    findOne(id: number): Promise<ProviderServiceWithOfferResponse>;
    update(id: number, providerId: number, updateProviderServiceDto: UpdateProviderServiceDto): Promise<ProviderServiceWithOfferResponse>;
    remove(id: number, providerId: number): Promise<{
        message: string;
    }>;
    addMultipleServices(providerId: number, addServicesDto: AddServicesDto): Promise<{
        message: string;
        services: ProviderServiceWithOfferResponse[];
    }>;
    removeMultipleServices(providerId: number, serviceIds: number[]): Promise<{
        message: string;
        removedCount: number;
    }>;
    toggleServiceStatus(id: number, providerId: number): Promise<ProviderServiceWithOfferResponse>;
    getServiceStats(providerId: number): Promise<{
        totalServices: number;
        activeServices: number;
        inactiveServices: number;
        averagePrice: number;
        services: {
            id: number;
            serviceId: number;
            serviceTitle: string;
            price: number;
            isActive: boolean;
        }[];
    }>;
}

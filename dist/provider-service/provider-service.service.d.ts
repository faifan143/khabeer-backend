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
export declare class ProviderServiceService {
    private readonly prisma;
    constructor(prisma: PrismaService);
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
    findAll(providerId?: number, activeOnly?: boolean): Promise<({
        service: {
            description: string;
            id: number;
            image: string;
            title: string;
            commission: number;
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
        id: number;
        isActive: boolean;
        providerId: number;
        price: number;
    })[]>;
    findByProvider(providerId: number, activeOnly?: boolean): Promise<({
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
    })[]>;
    findOne(id: number): Promise<{
        service: {
            description: string;
            id: number;
            image: string;
            title: string;
            commission: number;
        };
        provider: {
            id: number;
            name: string;
            image: string;
        };
    } & {
        serviceId: number;
        id: number;
        isActive: boolean;
        providerId: number;
        price: number;
    }>;
    update(id: number, providerId: number, updateProviderServiceDto: UpdateProviderServiceDto): Promise<{
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
    remove(id: number, providerId: number): Promise<{
        message: string;
    }>;
    addMultipleServices(providerId: number, addServicesDto: AddServicesDto): Promise<{
        message: string;
        services: ({
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
        })[];
    }>;
    removeMultipleServices(providerId: number, serviceIds: number[]): Promise<{
        message: string;
        removedCount: number;
    }>;
    toggleServiceStatus(id: number, providerId: number): Promise<{
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

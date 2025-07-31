import { ProviderServiceService, CreateProviderServiceDto, UpdateProviderServiceDto, AddServicesDto } from './provider-service.service';
export declare class ProviderServiceController {
    private readonly providerServiceService;
    constructor(providerServiceService: ProviderServiceService);
    create(createProviderServiceDto: CreateProviderServiceDto, req: any): Promise<{
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
    addMultipleServices(addServicesDto: AddServicesDto, req: any): Promise<{
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
    findAll(providerId?: string, activeOnly?: string): Promise<({
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
    findByProvider(providerId: number, activeOnly?: string): Promise<({
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
    getMyServices(req: any, activeOnly?: string): Promise<({
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
    getServiceStats(req: any): Promise<{
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
    update(id: number, updateProviderServiceDto: UpdateProviderServiceDto, req: any): Promise<{
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
    toggleServiceStatus(id: number, req: any): Promise<{
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
    remove(id: number, req: any): Promise<{
        message: string;
    }>;
    removeMultipleServices(body: {
        serviceIds: number[];
    }, req: any): Promise<{
        message: string;
        removedCount: number;
    }>;
}

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
        services: import("./provider-service.service").ProviderServiceWithOfferResponse[];
    }>;
    findAll(providerId?: string, activeOnly?: string): Promise<import("./provider-service.service").ProviderServiceWithOfferResponse[]>;
    findByProvider(providerId: number, activeOnly?: string): Promise<import("./provider-service.service").ProviderServiceWithOfferResponse[]>;
    getMyServices(req: any, activeOnly?: string): Promise<import("./provider-service.service").ProviderServiceWithOfferResponse[]>;
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
    findOne(id: number): Promise<import("./provider-service.service").ProviderServiceWithOfferResponse>;
    update(id: number, updateProviderServiceDto: UpdateProviderServiceDto, req: any): Promise<import("./provider-service.service").ProviderServiceWithOfferResponse>;
    toggleServiceStatus(id: number, req: any): Promise<import("./provider-service.service").ProviderServiceWithOfferResponse>;
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

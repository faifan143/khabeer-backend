export declare class CreateProviderDto {
    name: string;
    email?: string;
    password?: string;
    image: string;
    description: string;
    state: string;
    phone: string;
    isActive?: boolean;
    isVerified?: boolean;
    location?: any;
    officialDocuments?: string;
    serviceIds?: number[];
}

export declare enum RegisterType {
    USER = "user",
    PROVIDER = "provider"
}
export declare class RegisterDto {
    registerType: RegisterType;
    name: string;
    email?: string;
    password: string;
    role?: string;
    image?: string;
    address?: string;
    phone?: string;
    state?: string;
    fcm?: string;
    description?: string;
    isActive?: boolean;
    officialDocuments?: string;
    serviceIds?: number[];
}

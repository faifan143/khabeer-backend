export declare enum NotificationType {
    GENERAL = "general",
    ORDER = "order",
    OFFER = "offer",
    SYSTEM = "system"
}
export declare enum TargetAudience {
    CUSTOMERS = "customers",
    PROVIDERS = "providers",
    ALL = "all"
}
export declare class CreateNotificationDto {
    title: string;
    message: string;
    imageUrl?: string;
    targetAudience: TargetAudience[];
    notificationType?: NotificationType;
    data?: Record<string, any>;
}

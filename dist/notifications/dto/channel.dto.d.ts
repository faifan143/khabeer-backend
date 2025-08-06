export declare enum ChannelType {
    PROVIDERS = "providers",
    USERS = "users",
    ALL = "all"
}
export declare enum SubscriptionAction {
    SUBSCRIBE = "subscribe",
    UNSUBSCRIBE = "unsubscribe"
}
export declare class CreateChannelDto {
    name: string;
    type: ChannelType;
    description?: string;
}
export declare class SubscribeToChannelDto {
    fcmToken: string;
    channel: ChannelType;
}
export declare class UnsubscribeFromChannelDto {
    fcmToken: string;
    channel: ChannelType;
}
export declare class BulkSubscriptionDto {
    fcmTokens: string[];
    channel: ChannelType;
    action: SubscriptionAction;
}

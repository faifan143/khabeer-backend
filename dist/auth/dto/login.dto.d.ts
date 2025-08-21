export declare enum LoginType {
    USER = "user",
    PROVIDER = "provider"
}
export declare class LoginDto {
    loginType: LoginType;
    identifier: string;
    password: string;
    fcm?: string;
}

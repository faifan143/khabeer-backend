import { ConfigService } from '@nestjs/config';
export declare class HealthController {
    private readonly configService;
    constructor(configService: ConfigService);
    check(): {
        status: string;
        timestamp: string;
        uptime: number;
        environment: any;
        version: any;
    };
}

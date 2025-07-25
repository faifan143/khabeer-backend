import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Controller('health')
export class HealthController {
    constructor(private readonly configService: ConfigService) { }

    @Get()
    check() {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: this.configService.get('NODE_ENV', 'development'),
            version: this.configService.get('APP_VERSION', '1.0.0'),
        };
    }
} 
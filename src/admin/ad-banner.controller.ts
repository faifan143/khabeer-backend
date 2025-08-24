import { Controller, Get, Query } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdBannerResponseDto } from './dto/ad-banner.dto';

@Controller('ad-banners')
export class AdBannerController {
    constructor(private readonly adminService: AdminService) { }

    @Get()
    async getActiveAdBanners(
        @Query('limit') limit?: string
    ): Promise<AdBannerResponseDto[]> {
        const limitNumber = limit ? parseInt(limit, 10) : 10;
        return this.adminService.getActiveAdBanners(limitNumber);
    }

    @Get('featured')
    async getFeaturedBanners(): Promise<AdBannerResponseDto[]> {
        return this.adminService.getFeaturedBanners();
    }
}

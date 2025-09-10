import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    Request,
    ParseIntPipe
} from '@nestjs/common';
import { OffersService, CreateOfferDto, UpdateOfferDto } from './offers.service';
import { ComprehensiveAuthGuard } from '../auth/comprehensive-auth.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('offers')
@UseGuards(JwtAuthGuard, ComprehensiveAuthGuard)
export class OffersController {
    constructor(private readonly offersService: OffersService) { }

    @Post()
    @Roles('PROVIDER')
    async create(@Body() createOfferDto: CreateOfferDto, @Request() req) {
        return this.offersService.create(req.user.userId, createOfferDto);
    }

    @Get()
    async findAll(
        @Query('providerId') providerId?: string,
        @Query('serviceId') serviceId?: string,
        @Query('activeOnly') activeOnly?: string,
        @Request() req?: any
    ) {
        const providerIdNum = providerId ? parseInt(providerId, 10) : undefined;
        const serviceIdNum = serviceId ? parseInt(serviceId, 10) : undefined;
        const activeOnlyBool = activeOnly !== 'false'; // Default to true
        const userState = req?.user?.state;
        const userRole = req?.user?.role;

        return this.offersService.findAll(providerIdNum, serviceIdNum, activeOnlyBool, userState, userRole);
    }

    @Get('active')
    async getActiveOffers(@Query('limit') limit?: string, @Request() req?: any) {
        const limitNum = limit ? parseInt(limit, 10) : 20;
        const userState = req?.user?.state;
        const userRole = req?.user?.role;
        return this.offersService.getActiveOffers(limitNum, userState, userRole);
    }

    @Get('available')
    async getAvailableOffers(@Query('limit') limit?: string) {
        const limitNum = limit ? parseInt(limit, 10) : 20;
        return this.offersService.getAvailableOffers(limitNum);
    }

    @Get('debug/all')
    @Roles('ADMIN')
    async debugAllOffers() {
        return this.offersService.debugAllOffers();
    }

    @Get('debug/active-criteria')
    @Roles('ADMIN')
    async debugActiveOffersCriteria() {
        return this.offersService.debugActiveOffersCriteria();
    }

    @Get('debug/flexible')
    @Roles('ADMIN')
    async getFlexibleActiveOffers(@Query('limit') limit?: string) {
        const limitNum = limit ? parseInt(limit, 10) : 20;
        return this.offersService.getFlexibleActiveOffers(limitNum);
    }

    @Get('provider/:providerId')
    async getProviderOffers(@Param('providerId', ParseIntPipe) providerId: number) {
        return this.offersService.getProviderOffers(providerId);
    }

    @Get('my-offers')
    @Roles('PROVIDER')
    async getMyOffers(@Request() req) {
        return this.offersService.getProviderOffers(req.user.userId);
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.offersService.findOne(id);
    }

    @Put(':id')
    @Roles('PROVIDER')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateOfferDto: UpdateOfferDto,
        @Request() req
    ) {
        return this.offersService.update(id, req.user.userId, updateOfferDto);
    }

    @Delete(':id')
    @Roles('PROVIDER')
    async remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
        return this.offersService.remove(id, req.user.userId);
    }

    @Post('deactivate-expired')
    @Roles('ADMIN')
    async deactivateExpiredOffers() {
        return this.offersService.deactivateExpiredOffers();
    }
}

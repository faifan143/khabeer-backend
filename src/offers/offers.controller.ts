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
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('offers')
@UseGuards(JwtAuthGuard, RolesGuard)
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
        @Query('activeOnly') activeOnly?: string
    ) {
        const providerIdNum = providerId ? parseInt(providerId, 10) : undefined;
        const serviceIdNum = serviceId ? parseInt(serviceId, 10) : undefined;
        const activeOnlyBool = activeOnly !== 'false'; // Default to true

        return this.offersService.findAll(providerIdNum, serviceIdNum, activeOnlyBool);
    }

    @Get('active')
    async getActiveOffers(@Query('limit') limit?: string) {
        const limitNum = limit ? parseInt(limit, 10) : 20;
        return this.offersService.getActiveOffers(limitNum);
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

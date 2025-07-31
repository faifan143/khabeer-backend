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
import { ProviderRatingsService, CreateRatingDto, UpdateRatingDto } from './provider-ratings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('provider-ratings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProviderRatingsController {
    constructor(private readonly providerRatingsService: ProviderRatingsService) { }

    @Post()
    @Roles('USER')
    async create(@Body() createRatingDto: CreateRatingDto, @Request() req) {
        return this.providerRatingsService.create(req.user.userId, createRatingDto);
    }

    @Get()
    async findAll(@Query('providerId') providerId?: string) {
        const providerIdNum = providerId ? parseInt(providerId, 10) : undefined;
        return this.providerRatingsService.findAll(providerIdNum);
    }

    @Get('provider/:providerId')
    async findByProvider(@Param('providerId', ParseIntPipe) providerId: number) {
        return this.providerRatingsService.findByProvider(providerId);
    }

    @Get('top-rated')
    async getTopRatedProviders(@Query('limit') limit?: string) {
        const limitNum = limit ? parseInt(limit, 10) : 10;
        return this.providerRatingsService.getTopRatedProviders(limitNum);
    }

    @Get('my-ratings')
    @Roles('USER')
    async getMyRatings(@Request() req) {
        return this.providerRatingsService.getUserRatings(req.user.userId);
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.providerRatingsService.findOne(id);
    }

    @Put(':id')
    @Roles('USER')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateRatingDto: UpdateRatingDto,
        @Request() req
    ) {
        return this.providerRatingsService.update(id, req.user.userId, updateRatingDto);
    }

    @Delete(':id')
    @Roles('USER')
    async remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
        return this.providerRatingsService.remove(id, req.user.userId);
    }
}

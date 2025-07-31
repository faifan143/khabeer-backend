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
import { ProviderServiceService, CreateProviderServiceDto, UpdateProviderServiceDto, AddServicesDto } from './provider-service.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('provider-service')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProviderServiceController {
    constructor(private readonly providerServiceService: ProviderServiceService) { }

    @Post()
    @Roles('PROVIDER')
    async create(@Body() createProviderServiceDto: CreateProviderServiceDto, @Request() req) {
        return this.providerServiceService.create(req.user.userId, createProviderServiceDto);
    }

    @Post('add-multiple')
    @Roles('PROVIDER')
    async addMultipleServices(@Body() addServicesDto: AddServicesDto, @Request() req) {
        return this.providerServiceService.addMultipleServices(req.user.userId, addServicesDto);
    }

    @Get()
    async findAll(
        @Query('providerId') providerId?: string,
        @Query('activeOnly') activeOnly?: string
    ) {
        const providerIdNum = providerId ? parseInt(providerId, 10) : undefined;
        const activeOnlyBool = activeOnly === 'true';

        return this.providerServiceService.findAll(providerIdNum, activeOnlyBool);
    }

    @Get('provider/:providerId')
    async findByProvider(
        @Param('providerId', ParseIntPipe) providerId: number,
        @Query('activeOnly') activeOnly?: string
    ) {
        const activeOnlyBool = activeOnly === 'true';
        return this.providerServiceService.findByProvider(providerId, activeOnlyBool);
    }

    @Get('my-services')
    @Roles('PROVIDER')
    async getMyServices(@Request() req, @Query('activeOnly') activeOnly?: string) {
        const activeOnlyBool = activeOnly === 'true';
        return this.providerServiceService.findByProvider(req.user.userId, activeOnlyBool);
    }

    @Get('stats')
    @Roles('PROVIDER')
    async getServiceStats(@Request() req) {
        return this.providerServiceService.getServiceStats(req.user.userId);
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.providerServiceService.findOne(id);
    }

    @Put(':id')
    @Roles('PROVIDER')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateProviderServiceDto: UpdateProviderServiceDto,
        @Request() req
    ) {
        return this.providerServiceService.update(id, req.user.userId, updateProviderServiceDto);
    }

    @Put(':id/toggle')
    @Roles('PROVIDER')
    async toggleServiceStatus(@Param('id', ParseIntPipe) id: number, @Request() req) {
        return this.providerServiceService.toggleServiceStatus(id, req.user.userId);
    }

    @Delete(':id')
    @Roles('PROVIDER')
    async remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
        return this.providerServiceService.remove(id, req.user.userId);
    }

    @Delete('remove-multiple')
    @Roles('PROVIDER')
    async removeMultipleServices(@Body() body: { serviceIds: number[] }, @Request() req) {
        return this.providerServiceService.removeMultipleServices(req.user.userId, body.serviceIds);
    }
}

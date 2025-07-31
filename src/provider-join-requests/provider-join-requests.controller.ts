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
import { ProviderJoinRequestsService, CreateJoinRequestDto, UpdateJoinRequestDto } from './provider-join-requests.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('provider-join-requests')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProviderJoinRequestsController {
    constructor(private readonly providerJoinRequestsService: ProviderJoinRequestsService) { }

    @Post()
    @Roles('PROVIDER')
    async create(@Body() createJoinRequestDto: CreateJoinRequestDto, @Request() req) {
        return this.providerJoinRequestsService.create(req.user.userId, createJoinRequestDto);
    }

    @Get()
    @Roles('ADMIN')
    async findAll(@Query('status') status?: string) {
        return this.providerJoinRequestsService.findAll(status);
    }

    @Get('pending')
    @Roles('ADMIN')
    async getPendingRequests() {
        return this.providerJoinRequestsService.getPendingRequests();
    }

    @Get('stats')
    @Roles('ADMIN')
    async getRequestStats() {
        return this.providerJoinRequestsService.getRequestStats();
    }

    @Get('my-requests')
    @Roles('PROVIDER')
    async getMyRequests(@Request() req) {
        return this.providerJoinRequestsService.findByProvider(req.user.userId);
    }

    @Get('provider/:providerId')
    @Roles('ADMIN')
    async getProviderRequests(@Param('providerId', ParseIntPipe) providerId: number) {
        return this.providerJoinRequestsService.findByProvider(providerId);
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.providerJoinRequestsService.findOne(id);
    }

    @Put(':id')
    @Roles('ADMIN')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateJoinRequestDto: UpdateJoinRequestDto
    ) {
        return this.providerJoinRequestsService.update(id, updateJoinRequestDto);
    }

    @Put(':id/approve')
    @Roles('ADMIN')
    async approveRequest(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: { adminNotes?: string }
    ) {
        return this.providerJoinRequestsService.approveRequest(id, body.adminNotes);
    }

    @Put(':id/reject')
    @Roles('ADMIN')
    async rejectRequest(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: { adminNotes: string }
    ) {
        return this.providerJoinRequestsService.rejectRequest(id, body.adminNotes);
    }

    @Delete(':id')
    @Roles('ADMIN')
    async remove(@Param('id', ParseIntPipe) id: number) {
        return this.providerJoinRequestsService.remove(id);
    }
}

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
import { ProviderVerificationService, CreateVerificationDto, UpdateVerificationDto } from './provider-verification.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('provider-verification')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProviderVerificationController {
    constructor(private readonly providerVerificationService: ProviderVerificationService) { }

    @Post()
    @Roles('PROVIDER')
    async create(@Body() createVerificationDto: CreateVerificationDto, @Request() req) {
        return this.providerVerificationService.create(req.user.userId, createVerificationDto);
    }

    @Get()
    @Roles('ADMIN')
    async findAll(@Query('status') status?: string) {
        return this.providerVerificationService.findAll(status);
    }

    @Get('pending')
    @Roles('ADMIN')
    async getPendingVerifications() {
        return this.providerVerificationService.getPendingVerifications();
    }

    @Get('stats')
    @Roles('ADMIN')
    async getVerificationStats() {
        return this.providerVerificationService.getVerificationStats();
    }

    @Get('my-verification')
    @Roles('PROVIDER')
    async getMyVerification(@Request() req) {
        return this.providerVerificationService.findByProvider(req.user.userId);
    }

    @Get('provider/:providerId')
    @Roles('ADMIN')
    async getProviderVerification(@Param('providerId', ParseIntPipe) providerId: number) {
        return this.providerVerificationService.findByProvider(providerId);
    }

    @Put('admin/:providerId/documents')
    @Roles('ADMIN')
    async addDocumentsAdmin(
        @Param('providerId', ParseIntPipe) providerId: number,
        @Body() body: { documents: string[] }
    ) {
        return this.providerVerificationService.addDocumentsAdmin(providerId, body.documents);
    }

    @Delete('admin/:providerId/documents')
    @Roles('ADMIN')
    async removeDocumentAdmin(
        @Param('providerId', ParseIntPipe) providerId: number,
        @Body() body: { documentUrl: string }
    ) {
        return this.providerVerificationService.removeDocumentAdmin(providerId, body.documentUrl);
    }

    @Put('admin/:providerId/approve')
    @Roles('ADMIN')
    async approveVerificationAdmin(
        @Param('providerId', ParseIntPipe) providerId: number,
        @Body() body: { adminNotes?: string }
    ) {
        return this.providerVerificationService.approveVerificationByProviderId(providerId, body.adminNotes);
    }

    @Put('admin/:providerId/reject')
    @Roles('ADMIN')
    async rejectVerificationAdmin(
        @Param('providerId', ParseIntPipe) providerId: number,
        @Body() body: { adminNotes: string }
    ) {
        return this.providerVerificationService.rejectVerificationByProviderId(providerId, body.adminNotes);
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.providerVerificationService.findOne(id);
    }

    @Put(':id')
    @Roles('ADMIN')
    async update(
        @Param('id') id: string,
        @Body() updateVerificationDto: UpdateVerificationDto
    ) {
        return this.providerVerificationService.update(id, updateVerificationDto);
    }

    @Put(':id/approve')
    @Roles('ADMIN')
    async approveVerification(
        @Param('id') id: string,
        @Body() body: { adminNotes?: string }
    ) {
        return this.providerVerificationService.approveVerification(id, body.adminNotes);
    }

    @Put(':id/reject')
    @Roles('ADMIN')
    async rejectVerification(
        @Param('id') id: string,
        @Body() body: { adminNotes: string }
    ) {
        return this.providerVerificationService.rejectVerification(id, body.adminNotes);
    }

    @Put(':id/add-documents')
    @Roles('PROVIDER')
    async addDocuments(
        @Param('id') id: string,
        @Body() body: { documents: string[] },
        @Request() req
    ) {
        return this.providerVerificationService.addDocuments(id, req.user.userId, body.documents);
    }

    @Put(':id/remove-document')
    @Roles('PROVIDER')
    async removeDocument(
        @Param('id') id: string,
        @Body() body: { documentUrl: string },
        @Request() req
    ) {
        return this.providerVerificationService.removeDocument(id, req.user.userId, body.documentUrl);
    }

    @Delete(':id')
    @Roles('ADMIN')
    async remove(@Param('id') id: string) {
        return this.providerVerificationService.remove(id);
    }
} 
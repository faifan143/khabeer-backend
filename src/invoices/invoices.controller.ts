import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Post,
    Put,
    Query,
    Request,
    UseGuards
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateInvoiceDto, InvoicesService, UpdatePaymentStatusDto } from './invoices.service';

@Controller('invoices')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InvoicesController {
    constructor(private readonly invoicesService: InvoicesService) { }

    @Post()
    @Roles('ADMIN')
    async create(@Body() createInvoiceDto: CreateInvoiceDto) {
        return this.invoicesService.create(createInvoiceDto);
    }

    @Get()
    async findAll(@Request() req, @Query('status') status?: string) {
        const invoices = await this.invoicesService.findAll(req.user.userId, req.user.role, status);

        return invoices;
    }

    @Get('stats')
    async getStats(@Request() req) {
        return this.invoicesService.getPaymentStats(req.user.userId, req.user.role);
    }

    @Get('report')
    async generateReport(
        @Request() req,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string
    ) {
        const start = startDate ? new Date(startDate) : undefined;
        const end = endDate ? new Date(endDate) : undefined;

        return this.invoicesService.generateInvoiceReport(req.user.userId, req.user.role, start, end);
    }

    // Provider payment confirmation endpoints
    @Get('unpaid')
    @Roles('PROVIDER')
    async getUnpaidInvoices(@Request() req) {
        return this.invoicesService.getProviderUnpaidInvoices(req.user.userId);
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
        return this.invoicesService.findOne(id, req.user.userId, req.user.role);
    }

    @Put(':id/payment-status')
    async updatePaymentStatus(
        @Param('id', ParseIntPipe) id: number,
        @Body() updatePaymentStatusDto: UpdatePaymentStatusDto,
        @Request() req
    ) {
        return this.invoicesService.updatePaymentStatus(id, updatePaymentStatusDto, req.user.userId, req.user.role);
    }

    @Put(':id/mark-paid')
    async markAsPaid(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: { paymentMethod?: string },
        @Request() req
    ) {
        const updateDto: UpdatePaymentStatusDto = {
            paymentStatus: 'paid',
            paymentMethod: body.paymentMethod
        };

        return this.invoicesService.updatePaymentStatus(id, updateDto, req.user.userId, req.user.role);
    }

    @Put(':id/mark-failed')
    async markAsFailed(
        @Param('id', ParseIntPipe) id: number,
        @Request() req
    ) {
        const updateDto: UpdatePaymentStatusDto = {
            paymentStatus: 'failed'
        };

        return this.invoicesService.updatePaymentStatus(id, updateDto, req.user.userId, req.user.role);
    }

    @Put(':id/refund')
    async refund(
        @Param('id', ParseIntPipe) id: number,
        @Request() req
    ) {
        const updateDto: UpdatePaymentStatusDto = {
            paymentStatus: 'refunded'
        };

        return this.invoicesService.updatePaymentStatus(id, updateDto, req.user.userId, req.user.role);
    }

    @Get('admin/financial-summary')
    @Roles('ADMIN')
    async getAdminFinancialSummary(
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string
    ) {
        const start = startDate ? new Date(startDate) : undefined;
        const end = endDate ? new Date(endDate) : undefined;

        return this.invoicesService.getAdminFinancialSummary(start, end);
    }

    @Delete(':id')
    @Roles('ADMIN')
    async softDelete(@Param('id', ParseIntPipe) id: number, @Request() req) {
        return this.invoicesService.softDelete(id, req.user.userId, req.user.role);
    }

    @Put(':id/restore')
    @Roles('ADMIN')
    async restore(@Param('id', ParseIntPipe) id: number, @Request() req) {
        return this.invoicesService.restore(id, req.user.userId, req.user.role);
    }

    @Put(':id/reactivate')
    @Roles('ADMIN')
    async reactivateFailedInvoice(@Param('id', ParseIntPipe) id: number, @Request() req) {
        return this.invoicesService.reactivateFailedInvoice(id, req.user.userId, req.user.role);
    }

    @Get('admin/deleted')
    @Roles('ADMIN')
    async getDeletedInvoices(@Request() req) {
        return this.invoicesService.getDeletedInvoices(req.user.userId, req.user.role);
    }
}

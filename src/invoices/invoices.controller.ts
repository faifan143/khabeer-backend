import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Put,
    UseGuards,
    Request,
    ParseIntPipe,
    Query
} from '@nestjs/common';
import { InvoicesService, CreateInvoiceDto, UpdatePaymentStatusDto } from './invoices.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

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
        const invoices = await this.invoicesService.findAll(req.user.userId, req.user.role);

        if (status) {
            return invoices.filter(invoice => invoice.paymentStatus === status);
        }

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
}

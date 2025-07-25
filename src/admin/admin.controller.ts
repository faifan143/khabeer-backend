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
    ParseIntPipe,
    BadRequestException
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    @Get('dashboard')
    async getDashboard() {
        return this.adminService.getDashboardStats();
    }

    @Get('overview')
    async getOverview(@Query('period') period: string = '30') {
        return this.adminService.getOverviewStats(parseInt(period));
    }

    @Get('revenue')
    async getRevenueStats(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
        const start = startDate ? new Date(startDate) : undefined;
        const end = endDate ? new Date(endDate) : undefined;
        return this.adminService.getRevenueStats(start, end);
    }

    @Get('users/stats')
    async getUserStats() {
        return this.adminService.getUserStats();
    }

    @Get('providers/stats')
    async getProviderStats() {
        return this.adminService.getProviderStats();
    }

    @Get('orders/stats')
    async getOrderStats() {
        return this.adminService.getOrderStats();
    }

    @Get('services/stats')
    async getServiceStats() {
        return this.adminService.getServiceStats();
    }

    @Get('verifications/pending')
    async getPendingVerifications() {
        return this.adminService.getPendingVerifications();
    }

    @Get('join-requests/pending')
    async getPendingJoinRequests() {
        return this.adminService.getPendingJoinRequests();
    }

    @Put('verifications/:id/approve')
    async approveVerification(@Param('id') id: string, @Body() body: { notes?: string }) {
        return this.adminService.approveVerification(id, body.notes);
    }

    @Put('verifications/:id/reject')
    async rejectVerification(@Param('id') id: string, @Body() body: { notes: string }) {
        if (!body.notes) {
            throw new BadRequestException('Rejection notes are required');
        }
        return this.adminService.rejectVerification(id, body.notes);
    }

    @Put('join-requests/:id/approve')
    async approveJoinRequest(@Param('id', ParseIntPipe) id: number, @Body() body: { notes?: string }) {
        return this.adminService.approveJoinRequest(id, body.notes);
    }

    @Put('join-requests/:id/reject')
    async rejectJoinRequest(@Param('id', ParseIntPipe) id: number, @Body() body: { notes: string }) {
        if (!body.notes) {
            throw new BadRequestException('Rejection notes are required');
        }
        return this.adminService.rejectJoinRequest(id, body.notes);
    }

    @Put('users/:id/activate')
    async activateUser(@Param('id', ParseIntPipe) id: number) {
        return this.adminService.activateUser(id);
    }

    @Put('users/:id/deactivate')
    async deactivateUser(@Param('id', ParseIntPipe) id: number) {
        return this.adminService.deactivateUser(id);
    }

    @Put('providers/:id/activate')
    async activateProvider(@Param('id', ParseIntPipe) id: number) {
        return this.adminService.activateProvider(id);
    }

    @Put('providers/:id/deactivate')
    async deactivateProvider(@Param('id', ParseIntPipe) id: number) {
        return this.adminService.deactivateProvider(id);
    }

    @Put('providers/:id/verify')
    async verifyProvider(@Param('id', ParseIntPipe) id: number) {
        return this.adminService.verifyProvider(id);
    }

    @Put('providers/:id/unverify')
    async unverifyProvider(@Param('id', ParseIntPipe) id: number) {
        return this.adminService.unverifyProvider(id);
    }

    @Get('reports/orders')
    async getOrderReport(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
        const start = startDate ? new Date(startDate) : undefined;
        const end = endDate ? new Date(endDate) : undefined;
        return this.adminService.getOrderReport(start, end);
    }

    @Get('reports/revenue')
    async getRevenueReport(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
        const start = startDate ? new Date(startDate) : undefined;
        const end = endDate ? new Date(endDate) : undefined;
        return this.adminService.getRevenueReport(start, end);
    }

    @Get('reports/providers')
    async getProviderReport(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
        const start = startDate ? new Date(startDate) : undefined;
        const end = endDate ? new Date(endDate) : undefined;
        return this.adminService.getProviderReport(start, end);
    }

    @Get('reports/users')
    async getUserReport(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
        const start = startDate ? new Date(startDate) : undefined;
        const end = endDate ? new Date(endDate) : undefined;
        return this.adminService.getUserReport(start, end);
    }
} 
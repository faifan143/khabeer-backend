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
    BadRequestException,
    UseInterceptors,
    UploadedFile,
    UploadedFiles
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { FilesService } from '../files/files.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
    constructor(
        private readonly adminService: AdminService,
        private readonly filesService: FilesService
    ) { }

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

    @Get('providers')
    async getAllProviders() {
        return this.adminService.getAllProviders();
    }

    @Get('providers/unverified')
    async getUnverifiedProviders() {
        return this.adminService.getUnverifiedProviders();
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

    @Get('ratings')
    async getAllRatings() {
        return this.adminService.getAllRatings();
    }

    // Admin Orders Management Endpoints
    @Get('orders')
    async getAllOrders(@Query('page') page: string = '1', @Query('limit') limit: string = '1000') {
        return this.adminService.getAllOrders(parseInt(page), parseInt(limit));
    }

    @Put('orders/:id/status')
    async updateOrderStatus(@Param('id', ParseIntPipe) id: number, @Body() body: { status: string }) {
        return this.adminService.updateOrderStatus(id, body.status);
    }

    @Put('orders/:id/cancel')
    async cancelOrder(@Param('id', ParseIntPipe) id: number, @Body() body: { reason?: string }) {
        return this.adminService.cancelOrder(id, body.reason);
    }

    @Put('orders/:id/complete')
    async completeOrder(@Param('id', ParseIntPipe) id: number) {
        return this.adminService.completeOrder(id);
    }

    @Put('orders/:id/accept')
    async acceptOrder(@Param('id', ParseIntPipe) id: number, @Body() body: { notes?: string }) {
        return this.adminService.acceptOrder(id, body.notes);
    }

    @Put('orders/:id/reject')
    async rejectOrder(@Param('id', ParseIntPipe) id: number, @Body() body: { reason: string }) {
        if (!body.reason) {
            throw new BadRequestException('Rejection reason is required');
        }
        return this.adminService.rejectOrder(id, body.reason);
    }

    // Settings Endpoints
    @Get('settings')
    async getSystemSettings(@Query('category') category?: string) {
        return this.adminService.getSystemSettings(category);
    }

    @Post('settings')
    async updateSystemSetting(@Body() body: { key: string; value: string; description?: string; category?: string }) {
        return this.adminService.updateSystemSetting(body.key, body.value, body.description, body.category);
    }

    @Post('settings/upload-legal-documents')
    @UseInterceptors(FilesInterceptor('documents', 4, {
        storage: diskStorage({
            destination: './uploads/documents/legal',
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                const ext = extname(file.originalname);
                cb(null, `legal-${uniqueSuffix}${ext}`);
            },
        }),
    }))
    async uploadLegalDocuments(@UploadedFiles() files: Express.Multer.File[]) {
        const options = {
            maxSize: 10 * 1024 * 1024, // 10MB for documents
            allowedMimeTypes: [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'text/plain'
            ],
            allowedExtensions: ['.pdf', '.doc', '.docx', '.txt']
        };

        const results = await this.filesService.handleMultipleFiles(files, options);
        
        // Update URLs to include the correct subdirectory
        const updatedResults = results.map(result => ({
            ...result,
            url: this.filesService.getPublicUrl(result.filename, 'documents/legal')
        }));

        return {
            message: `Successfully uploaded ${results.length} legal documents`,
            documents: updatedResults
        };
    }

    @Post('settings/upload-banner-image')
    @UseInterceptors(FileInterceptor('image', {
        storage: diskStorage({
            destination: './uploads/images/banners',
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                const ext = extname(file.originalname);
                cb(null, `banner-${uniqueSuffix}${ext}`);
            },
        }),
    }))
    async uploadBannerImage(@UploadedFile() file: Express.Multer.File) {
        const options = {
            maxSize: 5 * 1024 * 1024, // 5MB for images
            allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif'],
            allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif']
        };

        const result = await this.filesService.handleUploadedFile(file, options);
        // Override the URL to include the correct subdirectory
        result.url = this.filesService.getPublicUrl(file.filename, 'images/banners');
        return {
            message: 'Banner image uploaded successfully',
            image: result
        };
    }

    @Get('subadmins')
    async getSubAdmins() {
        return this.adminService.getSubAdmins();
    }

    @Post('subadmins')
    async createSubAdmin(@Body() body: { name: string; email: string; password: string; permissions: string[] }) {
        return this.adminService.createSubAdmin(body.name, body.email, body.password, body.permissions);
    }

    @Delete('subadmins/:id')
    async deleteSubAdmin(@Param('id', ParseIntPipe) id: number) {
        return this.adminService.deleteSubAdmin(id);
    }

    @Get('ad-banners')
    async getAdBanners() {
        return this.adminService.getAdBanners();
    }

    @Post('ad-banners')
    @UseInterceptors(FileInterceptor('image', {
        storage: diskStorage({
            destination: './uploads/images/banners',
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                const ext = extname(file.originalname);
                cb(null, `banner-${uniqueSuffix}${ext}`);
            },
        }),
    }))
    async createAdBanner(
        @Body() body: {
            title: string;
            description: string;
            linkType: string;
            externalLink?: string;
            providerId?: number;
            isActive: boolean;
        },
        @UploadedFile() file: Express.Multer.File
    ) {
        const data: any = { ...body };
        if (file) {
            const options = {
                maxSize: 5 * 1024 * 1024, // 5MB for images
                allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif'],
                allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif']
            };
            const fileResult = await this.filesService.handleUploadedFile(file, options);
            // Override the URL to include the correct subdirectory
            fileResult.url = this.filesService.getPublicUrl(file.filename, 'images/banners');
            data.imageUrl = fileResult.url;
        }
        return this.adminService.createAdBanner(data);
    }

    @Put('ad-banners/:id')
    @UseInterceptors(FileInterceptor('image', {
        storage: diskStorage({
            destination: './uploads/images/banners',
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                const ext = extname(file.originalname);
                cb(null, `banner-${uniqueSuffix}${ext}`);
            },
        }),
    }))
    async updateAdBanner(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: {
            title?: string;
            description?: string;
            linkType?: string;
            externalLink?: string;
            providerId?: number;
            isActive?: boolean;
        },
        @UploadedFile() file: Express.Multer.File
    ) {
        const data: any = { ...body };
        if (file) {
            const options = {
                maxSize: 5 * 1024 * 1024, // 5MB for images
                allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif'],
                allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif']
            };
            const fileResult = await this.filesService.handleUploadedFile(file, options);
            // Override the URL to include the correct subdirectory
            fileResult.url = this.filesService.getPublicUrl(file.filename, 'images/banners');
            data.imageUrl = fileResult.url;
        }
        return this.adminService.updateAdBanner(id, data);
    }

    @Delete('ad-banners/:id')
    async deleteAdBanner(@Param('id', ParseIntPipe) id: number) {
        return this.adminService.deleteAdBanner(id);
    }

    // Notification Endpoints
    @Get('notifications')
    async getAllNotifications() {
        return this.adminService.getAllNotifications();
    }

    @Post('notifications')
    @UseInterceptors(FileInterceptor('image', {
        storage: diskStorage({
            destination: './uploads/images/notifications',
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                const ext = extname(file.originalname);
                cb(null, `notification-${uniqueSuffix}${ext}`);
            },
        }),
    }))
    async createNotification(
        @Body() body: {
            title: string;
            message: string;
            targetAudience: string[];
        },
        @UploadedFile() file: Express.Multer.File
    ) {
        const data: any = { ...body };
        if (file) {
            const options = {
                maxSize: 5 * 1024 * 1024, // 5MB for images
                allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif'],
                allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif']
            };
            const fileResult = await this.filesService.handleUploadedFile(file, options);
            // Override the URL to include the correct subdirectory
            fileResult.url = this.filesService.getPublicUrl(file.filename, 'images/notifications');
            data.imageUrl = fileResult.url;
        }
        return this.adminService.createNotification(data);
    }

    @Put('notifications/:id/send')
    async sendNotification(@Param('id', ParseIntPipe) id: number) {
        return this.adminService.sendNotification(id);
    }

    @Delete('notifications/:id')
    async deleteNotification(@Param('id', ParseIntPipe) id: number) {
        return this.adminService.deleteNotification(id);
    }

} 
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const admin_service_1 = require("./admin.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const files_service_1 = require("../files/files.service");
let AdminController = class AdminController {
    adminService;
    filesService;
    constructor(adminService, filesService) {
        this.adminService = adminService;
        this.filesService = filesService;
    }
    async getDashboard() {
        return this.adminService.getDashboardStats();
    }
    async getOverview(period = '30') {
        return this.adminService.getOverviewStats(parseInt(period));
    }
    async getRevenueStats(startDate, endDate) {
        const start = startDate ? new Date(startDate) : undefined;
        const end = endDate ? new Date(endDate) : undefined;
        return this.adminService.getRevenueStats(start, end);
    }
    async getUserStats() {
        return this.adminService.getUserStats();
    }
    async getProviderStats() {
        return this.adminService.getProviderStats();
    }
    async getAllProviders() {
        return this.adminService.getAllProviders();
    }
    async getUnverifiedProviders() {
        return this.adminService.getUnverifiedProviders();
    }
    async getOrderStats() {
        return this.adminService.getOrderStats();
    }
    async getServiceStats() {
        return this.adminService.getServiceStats();
    }
    async getPendingVerifications() {
        return this.adminService.getPendingVerifications();
    }
    async getPendingJoinRequests() {
        return this.adminService.getPendingJoinRequests();
    }
    async approveVerification(id, body) {
        return this.adminService.approveVerification(id, body.notes);
    }
    async rejectVerification(id, body) {
        if (!body.notes) {
            throw new common_1.BadRequestException('Rejection notes are required');
        }
        return this.adminService.rejectVerification(id, body.notes);
    }
    async approveJoinRequest(id, body) {
        return this.adminService.approveJoinRequest(id, body.notes);
    }
    async rejectJoinRequest(id, body) {
        if (!body.notes) {
            throw new common_1.BadRequestException('Rejection notes are required');
        }
        return this.adminService.rejectJoinRequest(id, body.notes);
    }
    async activateUser(id) {
        return this.adminService.activateUser(id);
    }
    async deactivateUser(id) {
        return this.adminService.deactivateUser(id);
    }
    async activateProvider(id) {
        return this.adminService.activateProvider(id);
    }
    async deactivateProvider(id) {
        return this.adminService.deactivateProvider(id);
    }
    async verifyProvider(id) {
        return this.adminService.verifyProvider(id);
    }
    async unverifyProvider(id) {
        return this.adminService.unverifyProvider(id);
    }
    async getOrderReport(startDate, endDate) {
        const start = startDate ? new Date(startDate) : undefined;
        const end = endDate ? new Date(endDate) : undefined;
        return this.adminService.getOrderReport(start, end);
    }
    async getRevenueReport(startDate, endDate) {
        const start = startDate ? new Date(startDate) : undefined;
        const end = endDate ? new Date(endDate) : undefined;
        return this.adminService.getRevenueReport(start, end);
    }
    async getProviderReport(startDate, endDate) {
        const start = startDate ? new Date(startDate) : undefined;
        const end = endDate ? new Date(endDate) : undefined;
        return this.adminService.getProviderReport(start, end);
    }
    async getUserReport(startDate, endDate) {
        const start = startDate ? new Date(startDate) : undefined;
        const end = endDate ? new Date(endDate) : undefined;
        return this.adminService.getUserReport(start, end);
    }
    async getAllRatings() {
        return this.adminService.getAllRatings();
    }
    async getAllOrders(page = '1', limit = '1000') {
        return this.adminService.getAllOrders(parseInt(page), parseInt(limit));
    }
    async updateOrderStatus(id, body) {
        return this.adminService.updateOrderStatus(id, body.status);
    }
    async cancelOrder(id, body) {
        return this.adminService.cancelOrder(id, body.reason);
    }
    async completeOrder(id) {
        return this.adminService.completeOrder(id);
    }
    async acceptOrder(id, body) {
        return this.adminService.acceptOrder(id, body.notes);
    }
    async rejectOrder(id, body) {
        if (!body.reason) {
            throw new common_1.BadRequestException('Rejection reason is required');
        }
        return this.adminService.rejectOrder(id, body.reason);
    }
    async getSystemSettings(category) {
        return this.adminService.getSystemSettings(category);
    }
    async updateSystemSetting(body) {
        return this.adminService.updateSystemSetting(body.key, body.value, body.description, body.category);
    }
    async uploadLegalDocuments(files) {
        const options = {
            maxSize: 10 * 1024 * 1024,
            allowedMimeTypes: [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'text/plain'
            ],
            allowedExtensions: ['.pdf', '.doc', '.docx', '.txt']
        };
        const results = await this.filesService.handleMultipleFiles(files, options);
        const updatedResults = results.map(result => ({
            ...result,
            url: this.filesService.getPublicUrl(result.filename, 'documents/legal')
        }));
        return {
            message: `Successfully uploaded ${results.length} legal documents`,
            documents: updatedResults
        };
    }
    async uploadBannerImage(file) {
        const options = {
            maxSize: 5 * 1024 * 1024,
            allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif'],
            allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif']
        };
        const result = await this.filesService.handleUploadedFile(file, options);
        result.url = this.filesService.getPublicUrl(file.filename, 'images/banners');
        return {
            message: 'Banner image uploaded successfully',
            image: result
        };
    }
    async getSubAdmins() {
        return this.adminService.getSubAdmins();
    }
    async createSubAdmin(body) {
        return this.adminService.createSubAdmin(body.name, body.email, body.password, body.permissions);
    }
    async deleteSubAdmin(id) {
        return this.adminService.deleteSubAdmin(id);
    }
    async getAdBanners() {
        return this.adminService.getAdBanners();
    }
    async createAdBanner(body, file) {
        const data = { ...body };
        if (file) {
            const options = {
                maxSize: 5 * 1024 * 1024,
                allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif'],
                allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif']
            };
            const fileResult = await this.filesService.handleUploadedFile(file, options);
            fileResult.url = this.filesService.getPublicUrl(file.filename, 'images/banners');
            data.imageUrl = fileResult.url;
        }
        return this.adminService.createAdBanner(data);
    }
    async updateAdBanner(id, body, file) {
        const data = { ...body };
        if (file) {
            const options = {
                maxSize: 5 * 1024 * 1024,
                allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif'],
                allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif']
            };
            const fileResult = await this.filesService.handleUploadedFile(file, options);
            fileResult.url = this.filesService.getPublicUrl(file.filename, 'images/banners');
            data.imageUrl = fileResult.url;
        }
        return this.adminService.updateAdBanner(id, data);
    }
    async deleteAdBanner(id) {
        return this.adminService.deleteAdBanner(id);
    }
    async getAllNotifications() {
        return this.adminService.getAllNotifications();
    }
    async createNotification(body, file) {
        const data = { ...body };
        if (file) {
            const options = {
                maxSize: 5 * 1024 * 1024,
                allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif'],
                allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif']
            };
            const fileResult = await this.filesService.handleUploadedFile(file, options);
            fileResult.url = this.filesService.getPublicUrl(file.filename, 'images/notifications');
            data.imageUrl = fileResult.url;
        }
        return this.adminService.createNotification(data);
    }
    async sendNotification(id) {
        return this.adminService.sendNotification(id);
    }
    async deleteNotification(id) {
        return this.adminService.deleteNotification(id);
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('dashboard'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('overview'),
    __param(0, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getOverview", null);
__decorate([
    (0, common_1.Get)('revenue'),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getRevenueStats", null);
__decorate([
    (0, common_1.Get)('users/stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getUserStats", null);
__decorate([
    (0, common_1.Get)('providers/stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getProviderStats", null);
__decorate([
    (0, common_1.Get)('providers'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAllProviders", null);
__decorate([
    (0, common_1.Get)('providers/unverified'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getUnverifiedProviders", null);
__decorate([
    (0, common_1.Get)('orders/stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getOrderStats", null);
__decorate([
    (0, common_1.Get)('services/stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getServiceStats", null);
__decorate([
    (0, common_1.Get)('verifications/pending'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getPendingVerifications", null);
__decorate([
    (0, common_1.Get)('join-requests/pending'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getPendingJoinRequests", null);
__decorate([
    (0, common_1.Put)('verifications/:id/approve'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "approveVerification", null);
__decorate([
    (0, common_1.Put)('verifications/:id/reject'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "rejectVerification", null);
__decorate([
    (0, common_1.Put)('join-requests/:id/approve'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "approveJoinRequest", null);
__decorate([
    (0, common_1.Put)('join-requests/:id/reject'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "rejectJoinRequest", null);
__decorate([
    (0, common_1.Put)('users/:id/activate'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "activateUser", null);
__decorate([
    (0, common_1.Put)('users/:id/deactivate'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deactivateUser", null);
__decorate([
    (0, common_1.Put)('providers/:id/activate'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "activateProvider", null);
__decorate([
    (0, common_1.Put)('providers/:id/deactivate'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deactivateProvider", null);
__decorate([
    (0, common_1.Put)('providers/:id/verify'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "verifyProvider", null);
__decorate([
    (0, common_1.Put)('providers/:id/unverify'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "unverifyProvider", null);
__decorate([
    (0, common_1.Get)('reports/orders'),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getOrderReport", null);
__decorate([
    (0, common_1.Get)('reports/revenue'),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getRevenueReport", null);
__decorate([
    (0, common_1.Get)('reports/providers'),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getProviderReport", null);
__decorate([
    (0, common_1.Get)('reports/users'),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getUserReport", null);
__decorate([
    (0, common_1.Get)('ratings'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAllRatings", null);
__decorate([
    (0, common_1.Get)('orders'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAllOrders", null);
__decorate([
    (0, common_1.Put)('orders/:id/status'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateOrderStatus", null);
__decorate([
    (0, common_1.Put)('orders/:id/cancel'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "cancelOrder", null);
__decorate([
    (0, common_1.Put)('orders/:id/complete'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "completeOrder", null);
__decorate([
    (0, common_1.Put)('orders/:id/accept'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "acceptOrder", null);
__decorate([
    (0, common_1.Put)('orders/:id/reject'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "rejectOrder", null);
__decorate([
    (0, common_1.Get)('settings'),
    __param(0, (0, common_1.Query)('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getSystemSettings", null);
__decorate([
    (0, common_1.Post)('settings'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateSystemSetting", null);
__decorate([
    (0, common_1.Post)('settings/upload-legal-documents'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('documents', 4, {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads/documents/legal',
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                const ext = (0, path_1.extname)(file.originalname);
                cb(null, `legal-${uniqueSuffix}${ext}`);
            },
        }),
    })),
    __param(0, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "uploadLegalDocuments", null);
__decorate([
    (0, common_1.Post)('settings/upload-banner-image'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('image', {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads/images/banners',
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                const ext = (0, path_1.extname)(file.originalname);
                cb(null, `banner-${uniqueSuffix}${ext}`);
            },
        }),
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "uploadBannerImage", null);
__decorate([
    (0, common_1.Get)('subadmins'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getSubAdmins", null);
__decorate([
    (0, common_1.Post)('subadmins'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createSubAdmin", null);
__decorate([
    (0, common_1.Delete)('subadmins/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deleteSubAdmin", null);
__decorate([
    (0, common_1.Get)('ad-banners'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAdBanners", null);
__decorate([
    (0, common_1.Post)('ad-banners'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('image', {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads/images/banners',
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                const ext = (0, path_1.extname)(file.originalname);
                cb(null, `banner-${uniqueSuffix}${ext}`);
            },
        }),
    })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createAdBanner", null);
__decorate([
    (0, common_1.Put)('ad-banners/:id'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('image', {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads/images/banners',
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                const ext = (0, path_1.extname)(file.originalname);
                cb(null, `banner-${uniqueSuffix}${ext}`);
            },
        }),
    })),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateAdBanner", null);
__decorate([
    (0, common_1.Delete)('ad-banners/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deleteAdBanner", null);
__decorate([
    (0, common_1.Get)('notifications'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAllNotifications", null);
__decorate([
    (0, common_1.Post)('notifications'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('image', {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads/images/notifications',
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                const ext = (0, path_1.extname)(file.originalname);
                cb(null, `notification-${uniqueSuffix}${ext}`);
            },
        }),
    })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createNotification", null);
__decorate([
    (0, common_1.Put)('notifications/:id/send'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "sendNotification", null);
__decorate([
    (0, common_1.Delete)('notifications/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deleteNotification", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.Controller)('admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __metadata("design:paramtypes", [admin_service_1.AdminService,
        files_service_1.FilesService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map
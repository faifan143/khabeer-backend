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
exports.InvoicesController = void 0;
const common_1 = require("@nestjs/common");
const invoices_service_1 = require("./invoices.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
let InvoicesController = class InvoicesController {
    invoicesService;
    constructor(invoicesService) {
        this.invoicesService = invoicesService;
    }
    async create(createInvoiceDto) {
        return this.invoicesService.create(createInvoiceDto);
    }
    async findAll(req, status) {
        const invoices = await this.invoicesService.findAll(req.user.userId, req.user.role);
        if (status) {
            return invoices.filter(invoice => invoice.paymentStatus === status);
        }
        return invoices;
    }
    async getStats(req) {
        return this.invoicesService.getPaymentStats(req.user.userId, req.user.role);
    }
    async generateReport(req, startDate, endDate) {
        const start = startDate ? new Date(startDate) : undefined;
        const end = endDate ? new Date(endDate) : undefined;
        return this.invoicesService.generateInvoiceReport(req.user.userId, req.user.role, start, end);
    }
    async getPendingConfirmations(req) {
        return this.invoicesService.getProviderPendingConfirmations(req.user.userId);
    }
    async findOne(id, req) {
        return this.invoicesService.findOne(id, req.user.userId, req.user.role);
    }
    async updatePaymentStatus(id, updatePaymentStatusDto, req) {
        return this.invoicesService.updatePaymentStatus(id, updatePaymentStatusDto, req.user.userId, req.user.role);
    }
    async markAsPaid(id, body, req) {
        const updateDto = {
            paymentStatus: 'paid',
            paymentMethod: body.paymentMethod
        };
        return this.invoicesService.updatePaymentStatus(id, updateDto, req.user.userId, req.user.role);
    }
    async markAsFailed(id, req) {
        const updateDto = {
            paymentStatus: 'failed'
        };
        return this.invoicesService.updatePaymentStatus(id, updateDto, req.user.userId, req.user.role);
    }
    async refund(id, req) {
        const updateDto = {
            paymentStatus: 'refunded'
        };
        return this.invoicesService.updatePaymentStatus(id, updateDto, req.user.userId, req.user.role);
    }
    async confirmPayment(id, req) {
        return this.invoicesService.confirmPayment(id, req.user.userId);
    }
};
exports.InvoicesController = InvoicesController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], InvoicesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], InvoicesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], InvoicesController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('report'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], InvoicesController.prototype, "generateReport", null);
__decorate([
    (0, common_1.Get)('pending-confirmations'),
    (0, roles_decorator_1.Roles)('PROVIDER'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], InvoicesController.prototype, "getPendingConfirmations", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], InvoicesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id/payment-status'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", Promise)
], InvoicesController.prototype, "updatePaymentStatus", null);
__decorate([
    (0, common_1.Put)(':id/mark-paid'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", Promise)
], InvoicesController.prototype, "markAsPaid", null);
__decorate([
    (0, common_1.Put)(':id/mark-failed'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], InvoicesController.prototype, "markAsFailed", null);
__decorate([
    (0, common_1.Put)(':id/refund'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], InvoicesController.prototype, "refund", null);
__decorate([
    (0, common_1.Put)(':id/confirm-payment'),
    (0, roles_decorator_1.Roles)('PROVIDER'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], InvoicesController.prototype, "confirmPayment", null);
exports.InvoicesController = InvoicesController = __decorate([
    (0, common_1.Controller)('invoices'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [invoices_service_1.InvoicesService])
], InvoicesController);
//# sourceMappingURL=invoices.controller.js.map
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AdminService = class AdminService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDashboardStats() {
        const [totalUsers, totalProviders, totalOrders, totalRevenue, pendingVerifications, pendingJoinRequests, activeUsers, activeProviders, completedOrders, totalCommission] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.provider.count(),
            this.prisma.order.count(),
            this.prisma.invoice.aggregate({
                where: { paymentStatus: 'paid' },
                _sum: { totalAmount: true }
            }),
            this.prisma.providerVerification.count({ where: { status: 'pending' } }),
            this.prisma.providerJoinRequest.count({ where: { status: 'pending' } }),
            this.prisma.user.count({ where: { isActive: true } }),
            this.prisma.provider.count({ where: { isActive: true } }),
            this.prisma.order.count({ where: { status: 'completed' } }),
            this.prisma.order.aggregate({
                where: { status: 'completed' },
                _sum: { commissionAmount: true }
            })
        ]);
        return {
            overview: {
                totalUsers,
                totalProviders,
                totalOrders,
                totalRevenue: totalRevenue._sum.totalAmount || 0,
                totalCommission: totalCommission._sum.commissionAmount || 0
            },
            pending: {
                verifications: pendingVerifications,
                joinRequests: pendingJoinRequests
            },
            active: {
                users: activeUsers,
                providers: activeProviders,
                completedOrders
            }
        };
    }
    async getOverviewStats(days = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const [newUsers, newProviders, newOrders, newRevenue] = await Promise.all([
            this.prisma.user.count({
                where: { createdAt: { gte: startDate } }
            }),
            this.prisma.provider.count({
                where: { createdAt: { gte: startDate } }
            }),
            this.prisma.order.count({
                where: { orderDate: { gte: startDate } }
            }),
            this.prisma.invoice.aggregate({
                where: {
                    paymentStatus: 'paid',
                    paymentDate: { gte: startDate }
                },
                _sum: { totalAmount: true }
            })
        ]);
        return {
            period: `${days} days`,
            newUsers,
            newProviders,
            newOrders,
            newRevenue: newRevenue._sum.totalAmount || 0
        };
    }
    async getRevenueStats(startDate, endDate) {
        const where = { paymentStatus: 'paid' };
        if (startDate || endDate) {
            where.paymentDate = {};
            if (startDate)
                where.paymentDate.gte = startDate;
            if (endDate)
                where.paymentDate.lte = endDate;
        }
        const revenue = await this.prisma.invoice.aggregate({
            where,
            _sum: { totalAmount: true },
            _count: { id: true }
        });
        const commission = await this.prisma.order.aggregate({
            where: {
                status: 'completed',
                orderDate: startDate || endDate ? {
                    ...(startDate && { gte: startDate }),
                    ...(endDate && { lte: endDate })
                } : undefined
            },
            _sum: { commissionAmount: true }
        });
        return {
            totalRevenue: revenue._sum.totalAmount || 0,
            totalTransactions: revenue._count.id,
            totalCommission: commission._sum.commissionAmount || 0,
            netRevenue: (revenue._sum.totalAmount || 0) - (commission._sum.commissionAmount || 0)
        };
    }
    async getUserStats() {
        const [total, active, inactive] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.user.count({ where: { isActive: true } }),
            this.prisma.user.count({ where: { isActive: false } })
        ]);
        return {
            total,
            active,
            inactive
        };
    }
    async getProviderStats() {
        const [total, active, inactive, verified, unverified] = await Promise.all([
            this.prisma.provider.count(),
            this.prisma.provider.count({ where: { isActive: true } }),
            this.prisma.provider.count({ where: { isActive: false } }),
            this.prisma.provider.count({ where: { isVerified: true } }),
            this.prisma.provider.count({ where: { isVerified: false } })
        ]);
        return {
            total,
            active,
            inactive,
            verified,
            unverified
        };
    }
    async getOrderStats() {
        const [total, completed, pending, inProgress, cancelled] = await Promise.all([
            this.prisma.order.count(),
            this.prisma.order.count({ where: { status: 'completed' } }),
            this.prisma.order.count({ where: { status: 'pending' } }),
            this.prisma.order.count({ where: { status: 'in_progress' } }),
            this.prisma.order.count({ where: { status: 'cancelled' } })
        ]);
        return {
            total,
            byStatus: [
                { status: 'completed', count: completed },
                { status: 'pending', count: pending },
                { status: 'in_progress', count: inProgress },
                { status: 'cancelled', count: cancelled }
            ]
        };
    }
    async getServiceStats() {
        const [total, popularServices] = await Promise.all([
            this.prisma.service.count(),
            this.prisma.service.findMany({
                include: {
                    category: true,
                    orders: {
                        where: { status: 'completed' }
                    }
                },
                take: 10
            })
        ]);
        return {
            total,
            popularServices: popularServices.map(service => ({
                ...service,
                orderCount: service.orders.length
            })).sort((a, b) => b.orderCount - a.orderCount)
        };
    }
    async getPendingVerifications() {
        return this.prisma.providerVerification.findMany({
            where: { status: 'pending' },
            include: {
                provider: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        description: true,
                        image: true
                    }
                }
            },
            orderBy: { createdAt: 'asc' }
        });
    }
    async getPendingJoinRequests() {
        return this.prisma.providerJoinRequest.findMany({
            where: { status: 'pending' },
            include: {
                provider: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        description: true,
                        image: true
                    }
                }
            },
            orderBy: { requestDate: 'asc' }
        });
    }
    async getAllProviders() {
        return this.prisma.provider.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                description: true,
                image: true,
                state: true,
                isActive: true,
                isVerified: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: {
                        orders: true,
                        providerServices: true,
                        ratings: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    async getUnverifiedProviders() {
        return this.prisma.provider.findMany({
            where: { isVerified: false },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                description: true,
                image: true,
                state: true,
                isActive: true,
                createdAt: true,
                officialDocuments: true,
                _count: {
                    select: {
                        providerServices: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    async approveVerification(id, notes) {
        const verification = await this.prisma.providerVerification.findUnique({
            where: { id },
            include: { provider: true }
        });
        if (!verification) {
            throw new common_1.NotFoundException('Verification not found');
        }
        if (verification.status !== 'pending') {
            throw new common_1.BadRequestException('Verification is not pending');
        }
        await this.prisma.$transaction([
            this.prisma.providerVerification.update({
                where: { id },
                data: {
                    status: 'approved',
                    adminNotes: notes,
                    updatedAt: new Date()
                }
            }),
            this.prisma.provider.update({
                where: { id: verification.providerId },
                data: { isVerified: true }
            })
        ]);
        return { message: 'Verification approved successfully' };
    }
    async rejectVerification(id, notes) {
        const verification = await this.prisma.providerVerification.findUnique({
            where: { id }
        });
        if (!verification) {
            throw new common_1.NotFoundException('Verification not found');
        }
        if (verification.status !== 'pending') {
            throw new common_1.BadRequestException('Verification is not pending');
        }
        await this.prisma.providerVerification.update({
            where: { id },
            data: {
                status: 'rejected',
                adminNotes: notes,
                updatedAt: new Date()
            }
        });
        return { message: 'Verification rejected successfully' };
    }
    async approveJoinRequest(id, notes) {
        const joinRequest = await this.prisma.providerJoinRequest.findUnique({
            where: { id },
            include: { provider: true }
        });
        if (!joinRequest) {
            throw new common_1.NotFoundException('Join request not found');
        }
        if (joinRequest.status !== 'pending') {
            throw new common_1.BadRequestException('Join request is not pending');
        }
        await this.prisma.providerJoinRequest.update({
            where: { id },
            data: {
                status: 'approved',
                adminNotes: notes
            }
        });
        return { message: 'Join request approved successfully' };
    }
    async rejectJoinRequest(id, notes) {
        const joinRequest = await this.prisma.providerJoinRequest.findUnique({
            where: { id }
        });
        if (!joinRequest) {
            throw new common_1.NotFoundException('Join request not found');
        }
        if (joinRequest.status !== 'pending') {
            throw new common_1.BadRequestException('Join request is not pending');
        }
        await this.prisma.providerJoinRequest.update({
            where: { id },
            data: {
                status: 'rejected',
                adminNotes: notes
            }
        });
        return { message: 'Join request rejected successfully' };
    }
    async activateUser(id) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        await this.prisma.user.update({
            where: { id },
            data: { isActive: true }
        });
        return { message: 'User activated successfully' };
    }
    async deactivateUser(id) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        await this.prisma.user.update({
            where: { id },
            data: { isActive: false }
        });
        return { message: 'User deactivated successfully' };
    }
    async activateProvider(id) {
        const provider = await this.prisma.provider.findUnique({ where: { id } });
        if (!provider) {
            throw new common_1.NotFoundException('Provider not found');
        }
        await this.prisma.provider.update({
            where: { id },
            data: { isActive: true }
        });
        return { message: 'Provider activated successfully' };
    }
    async deactivateProvider(id) {
        const provider = await this.prisma.provider.findUnique({ where: { id } });
        if (!provider) {
            throw new common_1.NotFoundException('Provider not found');
        }
        await this.prisma.provider.update({
            where: { id },
            data: { isActive: false }
        });
        return { message: 'Provider deactivated successfully' };
    }
    async verifyProvider(id) {
        const provider = await this.prisma.provider.findUnique({ where: { id } });
        if (!provider) {
            throw new common_1.NotFoundException('Provider not found');
        }
        if (provider.isVerified) {
            throw new common_1.BadRequestException('Provider is already verified');
        }
        await this.prisma.provider.update({
            where: { id },
            data: { isVerified: true }
        });
        return {
            message: 'Provider verified successfully. Provider can now login.',
            provider: {
                id: provider.id,
                name: provider.name,
                email: provider.email
            }
        };
    }
    async unverifyProvider(id) {
        const provider = await this.prisma.provider.findUnique({ where: { id } });
        if (!provider) {
            throw new common_1.NotFoundException('Provider not found');
        }
        await this.prisma.provider.update({
            where: { id },
            data: { isVerified: false }
        });
        return { message: 'Provider verification removed successfully' };
    }
    async getOrderReport(startDate, endDate) {
        const where = {};
        if (startDate || endDate) {
            where.orderDate = {};
            if (startDate)
                where.orderDate.gte = startDate;
            if (endDate)
                where.orderDate.lte = endDate;
        }
        const orders = await this.prisma.order.findMany({
            where,
            include: {
                user: {
                    select: { id: true, name: true, email: true }
                },
                provider: {
                    select: { id: true, name: true, phone: true }
                },
                service: {
                    select: { id: true, title: true, commission: true }
                },
                invoice: true
            },
            orderBy: { orderDate: 'desc' }
        });
        return orders.map(order => ({
            orderId: order.id,
            bookingId: order.bookingId,
            status: order.status,
            orderDate: order.orderDate,
            totalAmount: order.totalAmount,
            commissionAmount: order.commissionAmount,
            user: order.user,
            provider: order.provider,
            service: order.service,
            paymentStatus: order.invoice?.paymentStatus
        }));
    }
    async getRevenueReport(startDate, endDate) {
        const where = { paymentStatus: 'paid' };
        if (startDate || endDate) {
            where.paymentDate = {};
            if (startDate)
                where.paymentDate.gte = startDate;
            if (endDate)
                where.paymentDate.lte = endDate;
        }
        const invoices = await this.prisma.invoice.findMany({
            where,
            include: {
                order: {
                    include: {
                        user: { select: { name: true, email: true } },
                        provider: { select: { name: true, phone: true } },
                        service: { select: { title: true, commission: true } }
                    }
                }
            },
            orderBy: { paymentDate: 'desc' }
        });
        return invoices.map(invoice => ({
            invoiceId: invoice.id,
            orderId: invoice.order.id,
            paymentDate: invoice.paymentDate,
            totalAmount: invoice.totalAmount,
            discount: invoice.discount,
            netAmount: invoice.totalAmount - invoice.discount,
            commission: invoice.order.commissionAmount,
            user: invoice.order.user,
            provider: invoice.order.provider,
            service: invoice.order.service
        }));
    }
    async getProviderReport(startDate, endDate) {
        const where = {};
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate)
                where.createdAt.gte = startDate;
            if (endDate)
                where.createdAt.lte = endDate;
        }
        const providers = await this.prisma.provider.findMany({
            where,
            include: {
                providerServices: {
                    include: {
                        service: { select: { title: true } }
                    }
                },
                orders: {
                    where: { status: 'completed' }
                },
                ratings: true,
                verification: true
            },
            orderBy: { createdAt: 'desc' }
        });
        return providers.map(provider => ({
            providerId: provider.id,
            name: provider.name,
            phone: provider.phone,
            isActive: provider.isActive,
            isVerified: provider.isVerified,
            createdAt: provider.createdAt,
            services: provider.providerServices.length,
            completedOrders: provider.orders.length,
            averageRating: provider.ratings.length > 0
                ? provider.ratings.reduce((sum, r) => sum + r.rating, 0) / provider.ratings.length
                : 0,
            verificationStatus: provider.verification?.status || 'none'
        }));
    }
    async getUserReport(startDate, endDate) {
        const where = {};
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate)
                where.createdAt.gte = startDate;
            if (endDate)
                where.createdAt.lte = endDate;
        }
        const users = await this.prisma.user.findMany({
            where,
            include: {
                orders: {
                    where: { status: 'completed' }
                },
                ratings: true
            },
            orderBy: { createdAt: 'desc' }
        });
        return users.map(user => ({
            userId: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            isActive: user.isActive,
            createdAt: user.createdAt,
            completedOrders: user.orders.length,
            totalSpent: user.orders.reduce((sum, order) => sum + order.totalAmount, 0),
            ratingsGiven: user.ratings.length
        }));
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminService);
//# sourceMappingURL=admin.service.js.map
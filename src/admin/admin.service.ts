import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
    constructor(private readonly prisma: PrismaService) { }

    async getDashboardStats() {
        try {
            const [
                totalUsers,
                totalProviders,
                totalOrders,
                totalRevenue,
                pendingVerifications,
                pendingJoinRequests,
                activeUsers,
                activeProviders,
                completedOrders,
                totalCommission,
                // Additional data for dashboard
                popularServices,
                topProviders,
                orderStats
            ] = await Promise.all([
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
                }),
                // Get popular services with order counts
                this.prisma.service.findMany({
                    include: {
                        category: true,
                        orders: {
                            where: { status: 'completed' },
                            select: { id: true }
                        }
                    },
                    orderBy: {
                        orders: {
                            _count: 'desc'
                        }
                    },
                    take: 10
                }),
                // Get top providers with order counts and ratings
                this.prisma.provider.findMany({
                    include: {
                        orders: {
                            where: { status: 'completed' },
                            select: { id: true }
                        },
                        ratings: {
                            select: { rating: true }
                        }
                    },
                    orderBy: {
                        orders: {
                            _count: 'desc'
                        }
                    },
                    take: 10
                }),
                // Get order statistics
                this.getOrderStats()
            ]);

            // Process popular services
            const processedPopularServices = popularServices.map(service => ({
                id: service.id,
                name: service.title,
                description: service.description,
                price: service.commission,
                category: service.category ? {
                    id: service.category.id,
                    name: service.category.titleEn
                } : null,
                orderCount: service.orders.length
            }));

            // Process top providers
            const processedTopProviders = topProviders.map(provider => {
                const avgRating = provider.ratings.length > 0
                    ? provider.ratings.reduce((sum, r) => sum + r.rating, 0) / provider.ratings.length
                    : 0;

                return {
                    id: provider.id,
                    name: provider.name,
                    email: provider.email || '',
                    phone: provider.phone,
                    description: provider.description,
                    image: provider.image,
                    state: provider.state,
                    isActive: provider.isActive,
                    isVerified: provider.isVerified,
                    orderCount: provider.orders.length,
                    rating: avgRating
                };
            });

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
                },
                // Include all the additional data
                popularServices: processedPopularServices,
                topProviders: processedTopProviders,
                orderStats
            };
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            // Return default values in case of error
            return {
                overview: {
                    totalUsers: 0,
                    totalProviders: 0,
                    totalOrders: 0,
                    totalRevenue: 0,
                    totalCommission: 0
                },
                pending: {
                    verifications: 0,
                    joinRequests: 0
                },
                active: {
                    users: 0,
                    providers: 0,
                    completedOrders: 0
                },
                popularServices: [],
                topProviders: [],
                orderStats: {
                    total: 0,
                    today: 0,
                    yesterday: 0,
                    thisWeek: 0,
                    thisMonth: 0,
                    byStatus: []
                }
            };
        }
    }

    async getOverviewStats(days: number = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const [
            newUsers,
            newProviders,
            newOrders,
            newRevenue
        ] = await Promise.all([
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

    async getRevenueStats(startDate?: Date, endDate?: Date) {
        const where: any = { paymentStatus: 'paid' };
        if (startDate || endDate) {
            where.paymentDate = {};
            if (startDate) where.paymentDate.gte = startDate;
            if (endDate) where.paymentDate.lte = endDate;
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
        const [total, active, inactive, verified, unverified, topProviders] = await Promise.all([
            this.prisma.provider.count(),
            this.prisma.provider.count({ where: { isActive: true } }),
            this.prisma.provider.count({ where: { isActive: false } }),
            this.prisma.provider.count({ where: { isVerified: true } }),
            this.prisma.provider.count({ where: { isVerified: false } }),
            this.prisma.provider.findMany({
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
                    orders: {
                        where: { status: 'completed' }
                    },
                    ratings: {
                        select: {
                            rating: true
                        }
                    }
                },
                take: 10,
                orderBy: {
                    orders: {
                        _count: 'desc'
                    }
                }
            })
        ]);

        const providersWithStats = topProviders.map(provider => {
            const avgRating = provider.ratings.length > 0
                ? provider.ratings.reduce((sum, r) => sum + r.rating, 0) / provider.ratings.length
                : 0;

            return {
                id: provider.id,
                name: provider.name,
                email: provider.email,
                phone: provider.phone,
                description: provider.description,
                image: provider.image,
                state: provider.state,
                isActive: provider.isActive,
                isVerified: provider.isVerified,
                orderCount: provider.orders.length,
                rating: avgRating
            };
        }).sort((a, b) => b.orderCount - a.orderCount);

        return {
            total,
            active,
            inactive,
            verified,
            unverified,
            topProviders: providersWithStats
        };
    }

    async getOrderStats() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const thisWeek = new Date(today);
        thisWeek.setDate(thisWeek.getDate() - 7);

        const thisMonth = new Date(today);
        thisMonth.setMonth(thisMonth.getMonth() - 1);

        const [total, completed, pending, inProgress, cancelled, todayOrders, yesterdayOrders, thisWeekOrders, thisMonthOrders] = await Promise.all([
            this.prisma.order.count(),
            this.prisma.order.count({ where: { status: 'completed' } }),
            this.prisma.order.count({ where: { status: 'pending' } }),
            this.prisma.order.count({ where: { status: 'in_progress' } }),
            this.prisma.order.count({ where: { status: 'cancelled' } }),
            this.prisma.order.count({ where: { orderDate: { gte: today } } }),
            this.prisma.order.count({ where: { orderDate: { gte: yesterday, lt: today } } }),
            this.prisma.order.count({ where: { orderDate: { gte: thisWeek } } }),
            this.prisma.order.count({ where: { orderDate: { gte: thisMonth } } })
        ]);

        return {
            total,
            today: todayOrders,
            yesterday: yesterdayOrders,
            thisWeek: thisWeekOrders,
            thisMonth: thisMonthOrders,
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

    async approveVerification(id: string, notes?: string) {
        const verification = await this.prisma.providerVerification.findUnique({
            where: { id },
            include: { provider: true }
        });

        if (!verification) {
            throw new NotFoundException('Verification not found');
        }

        if (verification.status !== 'pending') {
            throw new BadRequestException('Verification is not pending');
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

    async rejectVerification(id: string, notes: string) {
        const verification = await this.prisma.providerVerification.findUnique({
            where: { id }
        });

        if (!verification) {
            throw new NotFoundException('Verification not found');
        }

        if (verification.status !== 'pending') {
            throw new BadRequestException('Verification is not pending');
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

    async approveJoinRequest(id: number, notes?: string) {
        const joinRequest = await this.prisma.providerJoinRequest.findUnique({
            where: { id },
            include: { provider: true }
        });

        if (!joinRequest) {
            throw new NotFoundException('Join request not found');
        }

        if (joinRequest.status !== 'pending') {
            throw new BadRequestException('Join request is not pending');
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

    async rejectJoinRequest(id: number, notes: string) {
        const joinRequest = await this.prisma.providerJoinRequest.findUnique({
            where: { id }
        });

        if (!joinRequest) {
            throw new NotFoundException('Join request not found');
        }

        if (joinRequest.status !== 'pending') {
            throw new BadRequestException('Join request is not pending');
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

    async activateUser(id: number) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        await this.prisma.user.update({
            where: { id },
            data: { isActive: true }
        });

        return { message: 'User activated successfully' };
    }

    async deactivateUser(id: number) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        await this.prisma.user.update({
            where: { id },
            data: { isActive: false }
        });

        return { message: 'User deactivated successfully' };
    }

    async activateProvider(id: number) {
        const provider = await this.prisma.provider.findUnique({ where: { id } });
        if (!provider) {
            throw new NotFoundException('Provider not found');
        }

        await this.prisma.provider.update({
            where: { id },
            data: { isActive: true }
        });

        return { message: 'Provider activated successfully' };
    }

    async deactivateProvider(id: number) {
        const provider = await this.prisma.provider.findUnique({ where: { id } });
        if (!provider) {
            throw new NotFoundException('Provider not found');
        }

        await this.prisma.provider.update({
            where: { id },
            data: { isActive: false }
        });

        return { message: 'Provider deactivated successfully' };
    }

    async verifyProvider(id: number) {
        const provider = await this.prisma.provider.findUnique({ where: { id } });
        if (!provider) {
            throw new NotFoundException('Provider not found');
        }

        if (provider.isVerified) {
            throw new BadRequestException('Provider is already verified');
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

    async unverifyProvider(id: number) {
        const provider = await this.prisma.provider.findUnique({ where: { id } });
        if (!provider) {
            throw new NotFoundException('Provider not found');
        }

        await this.prisma.provider.update({
            where: { id },
            data: { isVerified: false }
        });

        return { message: 'Provider verification removed successfully' };
    }

    async getOrderReport(startDate?: Date, endDate?: Date) {
        const where: any = {};
        if (startDate || endDate) {
            where.orderDate = {};
            if (startDate) where.orderDate.gte = startDate;
            if (endDate) where.orderDate.lte = endDate;
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

    async getRevenueReport(startDate?: Date, endDate?: Date) {
        const where: any = { paymentStatus: 'paid' };
        if (startDate || endDate) {
            where.paymentDate = {};
            if (startDate) where.paymentDate.gte = startDate;
            if (endDate) where.paymentDate.lte = endDate;
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

    async getProviderReport(startDate?: Date, endDate?: Date) {
        const where: any = {};
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) where.createdAt.gte = startDate;
            if (endDate) where.createdAt.lte = endDate;
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

    async getUserReport(startDate?: Date, endDate?: Date) {
        const where: any = {};
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) where.createdAt.gte = startDate;
            if (endDate) where.createdAt.lte = endDate;
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

    // Payment verification methods

    // Admin Orders Management Methods
    async getAllOrders(page: number = 1, limit: number = 1000) {
        const skip = (page - 1) * limit;

        const orders = await this.prisma.order.findMany({
            skip,
            take: limit,
            include: {
                user: {
                    select: { id: true, name: true, email: true, phone: true }
                },
                provider: {
                    select: { id: true, name: true, email: true, phone: true }
                },
                service: {
                    select: { id: true, title: true, description: true, commission: true }
                },
                invoice: true
            },
            orderBy: { orderDate: 'desc' }
        });

        const total = await this.prisma.order.count();

        return {
            data: orders,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    async updateOrderStatus(id: number, status: string) {
        const order = await this.prisma.order.update({
            where: { id },
            data: { status },
            include: {
                user: { select: { name: true, email: true } },
                provider: { select: { name: true, email: true } },
                service: { select: { title: true } }
            }
        });

        return { message: 'Order status updated successfully', order };
    }

    async cancelOrder(id: number, reason?: string) {
        const order = await this.prisma.order.update({
            where: { id },
            data: {
                status: 'cancelled',
                // You might want to store the cancellation reason in a separate table
            },
            include: {
                user: { select: { name: true, email: true } },
                provider: { select: { name: true, email: true } },
                service: { select: { title: true } }
            }
        });

        return { message: 'Order cancelled successfully', order };
    }

    async completeOrder(id: number) {
        const order = await this.prisma.order.update({
            where: { id },
            data: { status: 'completed' },
            include: {
                user: { select: { name: true, email: true } },
                provider: { select: { name: true, email: true } },
                service: { select: { title: true } }
            }
        });

        return { message: 'Order completed successfully', order };
    }

    async acceptOrder(id: number, notes?: string) {
        const order = await this.prisma.order.update({
            where: { id },
            data: { 
                status: 'accepted',
                // You might want to store admin notes in a separate table
            },
            include: {
                user: { select: { name: true, email: true } },
                provider: { select: { name: true, email: true } },
                service: { select: { title: true } }
            }
        });

        return { message: 'Order accepted successfully', order };
    }

    async rejectOrder(id: number, reason: string) {
        const order = await this.prisma.order.update({
            where: { id },
            data: { 
                status: 'cancelled',
                // You might want to store the rejection reason in a separate table
            },
            include: {
                user: { select: { name: true, email: true } },
                provider: { select: { name: true, email: true } },
                service: { select: { title: true } }
            }
        });

        return { message: 'Order rejected successfully', order };
    }
} 
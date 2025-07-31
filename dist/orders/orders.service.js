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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const order_status_dto_1 = require("./dto/order-status.dto");
let OrdersService = class OrdersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createOrderDto, userId) {
        const provider = await this.prisma.provider.findUnique({
            where: { id: createOrderDto.providerId },
            include: { providerServices: true }
        });
        if (!provider) {
            throw new common_1.NotFoundException('Provider not found');
        }
        if (!provider.isActive) {
            throw new common_1.BadRequestException('Provider is not active');
        }
        const service = await this.prisma.service.findUnique({
            where: { id: createOrderDto.serviceId }
        });
        if (!service) {
            throw new common_1.NotFoundException('Service not found');
        }
        const providerService = provider.providerServices.find(ps => ps.serviceId === createOrderDto.serviceId && ps.isActive);
        if (!providerService) {
            throw new common_1.BadRequestException('Provider does not offer this service');
        }
        const now = new Date();
        const validOffer = await this.prisma.offer.findFirst({
            where: {
                providerId: createOrderDto.providerId,
                serviceId: createOrderDto.serviceId,
                isActive: true,
                startDate: { lte: now },
                endDate: { gt: now }
            },
            orderBy: {
                offerPrice: 'asc'
            }
        });
        const providerPrice = providerService.price;
        const commission = service.commission;
        const quantity = createOrderDto.quantity || 1;
        const finalProviderPrice = validOffer ? validOffer.offerPrice : providerPrice;
        const originalPrice = providerPrice;
        const discount = validOffer ? (originalPrice - finalProviderPrice) * quantity : 0;
        const providerAmount = finalProviderPrice * quantity;
        const commissionAmount = commission * quantity;
        const totalAmount = providerAmount + commissionAmount;
        const order = await this.prisma.order.create({
            data: {
                userId,
                providerId: createOrderDto.providerId,
                serviceId: createOrderDto.serviceId,
                scheduledDate: createOrderDto.scheduledDate ? new Date(createOrderDto.scheduledDate) : null,
                location: createOrderDto.location,
                locationDetails: createOrderDto.locationDetails,
                providerLocation: createOrderDto.providerLocation,
                quantity,
                totalAmount,
                providerAmount,
                commissionAmount,
                status: order_status_dto_1.OrderStatus.PENDING
            },
            include: {
                user: true,
                provider: true,
                service: true,
                invoice: true
            }
        });
        await this.prisma.invoice.create({
            data: {
                orderId: order.id,
                totalAmount: order.totalAmount,
                discount: discount,
                paymentStatus: 'pending'
            }
        });
        const orderWithOffer = {
            ...order,
            appliedOffer: validOffer ? {
                id: validOffer.id,
                title: validOffer.description,
                originalPrice: originalPrice,
                offerPrice: finalProviderPrice,
                discount: discount,
                savings: discount
            } : null
        };
        return orderWithOffer;
    }
    async findAll(userId, role) {
        const where = role === 'PROVIDER'
            ? { providerId: userId }
            : { userId };
        return this.prisma.order.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        email: true
                    }
                },
                provider: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        image: true
                    }
                },
                service: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        image: true
                    }
                },
                invoice: true
            },
            orderBy: {
                orderDate: 'desc'
            }
        });
    }
    async findOne(id, userId, role) {
        const where = role === 'PROVIDER'
            ? { id, providerId: userId }
            : { id, userId };
        const order = await this.prisma.order.findFirst({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        email: true,
                        address: true
                    }
                },
                provider: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        image: true,
                        description: true
                    }
                },
                service: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        image: true,
                        commission: true
                    }
                },
                invoice: true
            }
        });
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        return order;
    }
    async updateStatus(id, updateStatusDto, userId, role) {
        const order = await this.prisma.order.findUnique({
            where: { id },
            include: { provider: true }
        });
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        if (role === 'PROVIDER' && order.providerId !== userId) {
            throw new common_1.ForbiddenException('You can only update your own orders');
        }
        if (role === 'USER' && order.userId !== userId) {
            throw new common_1.ForbiddenException('You can only update your own orders');
        }
        const validTransitions = this.getValidStatusTransitions(order.status, role);
        if (!validTransitions.includes(updateStatusDto.status)) {
            throw new common_1.BadRequestException(`Invalid status transition from ${order.status} to ${updateStatusDto.status}`);
        }
        const updateData = {
            status: updateStatusDto.status
        };
        if (updateStatusDto.providerLocation && role === 'PROVIDER') {
            updateData.providerLocation = updateStatusDto.providerLocation;
        }
        return this.prisma.order.update({
            where: { id },
            data: updateData,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        email: true
                    }
                },
                provider: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        image: true
                    }
                },
                service: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        image: true
                    }
                },
                invoice: true
            }
        });
    }
    async cancel(id, userId, role) {
        const order = await this.prisma.order.findUnique({
            where: { id }
        });
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        if (role === 'PROVIDER' && order.providerId !== userId) {
            throw new common_1.ForbiddenException('You can only cancel your own orders');
        }
        if (role === 'USER' && order.userId !== userId) {
            throw new common_1.ForbiddenException('You can only cancel your own orders');
        }
        if (!['pending', 'accepted'].includes(order.status)) {
            throw new common_1.BadRequestException('Order cannot be cancelled in current status');
        }
        return this.prisma.order.update({
            where: { id },
            data: { status: order_status_dto_1.OrderStatus.CANCELLED },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        email: true
                    }
                },
                provider: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        image: true
                    }
                },
                service: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        image: true
                    }
                },
                invoice: true
            }
        });
    }
    async getOrderStats(userId, role) {
        const where = role === 'PROVIDER'
            ? { providerId: userId }
            : { userId };
        const [total, pending, accepted, inProgress, completed, cancelled] = await Promise.all([
            this.prisma.order.count({ where }),
            this.prisma.order.count({ where: { ...where, status: order_status_dto_1.OrderStatus.PENDING } }),
            this.prisma.order.count({ where: { ...where, status: order_status_dto_1.OrderStatus.ACCEPTED } }),
            this.prisma.order.count({ where: { ...where, status: order_status_dto_1.OrderStatus.IN_PROGRESS } }),
            this.prisma.order.count({ where: { ...where, status: order_status_dto_1.OrderStatus.COMPLETED } }),
            this.prisma.order.count({ where: { ...where, status: order_status_dto_1.OrderStatus.CANCELLED } })
        ]);
        const totalRevenue = await this.prisma.order.aggregate({
            where: { ...where, status: order_status_dto_1.OrderStatus.COMPLETED },
            _sum: { totalAmount: true }
        });
        return {
            total,
            pending,
            accepted,
            inProgress,
            completed,
            cancelled,
            totalRevenue: totalRevenue._sum.totalAmount || 0,
            completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
        };
    }
    async getOrderHistory(userId, role, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const where = role === 'PROVIDER'
            ? { providerId: userId }
            : { userId };
        const [orders, total] = await Promise.all([
            this.prisma.order.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            phone: true,
                            email: true
                        }
                    },
                    provider: {
                        select: {
                            id: true,
                            name: true,
                            phone: true,
                            email: true
                        }
                    },
                    service: true,
                    invoice: true
                },
                orderBy: { orderDate: 'desc' },
                skip,
                take: limit
            }),
            this.prisma.order.count({ where })
        ]);
        return {
            data: orders,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            }
        };
    }
    async getOrderAnalytics(userId, role, startDate, endDate) {
        const baseWhere = role === 'PROVIDER'
            ? { providerId: userId }
            : { userId };
        const where = {
            ...baseWhere,
            ...(startDate || endDate ? {
                orderDate: {
                    ...(startDate ? { gte: startDate } : {}),
                    ...(endDate ? { lte: endDate } : {})
                }
            } : {})
        };
        const orders = await this.prisma.order.findMany({
            where,
            include: {
                service: true,
                invoice: true
            },
            orderBy: { orderDate: 'asc' }
        });
        const monthlyData = this.calculateMonthlyAnalytics(orders);
        const serviceAnalytics = this.calculateServiceAnalytics(orders);
        const statusAnalytics = this.calculateStatusAnalytics(orders);
        return {
            monthlyData,
            serviceAnalytics,
            statusAnalytics,
            totalOrders: orders.length,
            totalRevenue: orders.reduce((sum, order) => sum + order.totalAmount, 0),
            averageOrderValue: orders.length > 0 ? orders.reduce((sum, order) => sum + order.totalAmount, 0) / orders.length : 0
        };
    }
    async bulkUpdateStatus(orderIds, status, userId, role) {
        if (role !== 'PROVIDER') {
            throw new common_1.ForbiddenException('Only providers can perform bulk updates');
        }
        const orders = await this.prisma.order.findMany({
            where: {
                id: { in: orderIds },
                providerId: userId
            }
        });
        if (orders.length !== orderIds.length) {
            throw new common_1.BadRequestException('Some orders not found or not accessible');
        }
        const updatePromises = orders.map(order => {
            const validTransitions = this.getValidStatusTransitions(order.status, role);
            if (!validTransitions.includes(status)) {
                throw new common_1.BadRequestException(`Invalid status transition from ${order.status} to ${status}`);
            }
            return this.prisma.order.update({
                where: { id: order.id },
                data: { status }
            });
        });
        await Promise.all(updatePromises);
        return { message: `Successfully updated ${orders.length} orders to ${status}` };
    }
    async getOrdersByDateRange(userId, role, startDate, endDate) {
        const baseWhere = role === 'PROVIDER'
            ? { providerId: userId }
            : { userId };
        const where = {
            ...baseWhere,
            orderDate: {
                gte: startDate,
                lte: endDate
            }
        };
        return this.prisma.order.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        email: true
                    }
                },
                provider: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        email: true
                    }
                },
                service: true,
                invoice: true
            },
            orderBy: { orderDate: 'desc' }
        });
    }
    async getOrdersByStatus(userId, role, status) {
        const baseWhere = role === 'PROVIDER'
            ? { providerId: userId }
            : { userId };
        const where = {
            ...baseWhere,
            status
        };
        return this.prisma.order.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        email: true
                    }
                },
                provider: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        email: true
                    }
                },
                service: true,
                invoice: true
            },
            orderBy: { orderDate: 'desc' }
        });
    }
    async getUpcomingOrders(userId, role) {
        const baseWhere = role === 'PROVIDER'
            ? { providerId: userId }
            : { userId };
        const where = {
            ...baseWhere,
            scheduledDate: {
                gte: new Date()
            },
            status: {
                in: [order_status_dto_1.OrderStatus.PENDING, order_status_dto_1.OrderStatus.ACCEPTED]
            }
        };
        return this.prisma.order.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        email: true
                    }
                },
                provider: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        email: true
                    }
                },
                service: true,
                invoice: true
            },
            orderBy: { scheduledDate: 'asc' }
        });
    }
    async getOverdueOrders(userId, role) {
        const baseWhere = role === 'PROVIDER'
            ? { providerId: userId }
            : { userId };
        const where = {
            ...baseWhere,
            scheduledDate: {
                lt: new Date()
            },
            status: {
                in: [order_status_dto_1.OrderStatus.ACCEPTED, order_status_dto_1.OrderStatus.IN_PROGRESS]
            }
        };
        return this.prisma.order.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        email: true
                    }
                },
                provider: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        email: true
                    }
                },
                service: true,
                invoice: true
            },
            orderBy: { scheduledDate: 'asc' }
        });
    }
    calculateMonthlyAnalytics(orders) {
        const monthlyData = {};
        orders.forEach(order => {
            const month = order.orderDate.toISOString().substring(0, 7);
            if (!monthlyData[month]) {
                monthlyData[month] = {
                    month,
                    orders: 0,
                    revenue: 0
                };
            }
            monthlyData[month].orders++;
            monthlyData[month].revenue += order.totalAmount;
        });
        return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
    }
    calculateServiceAnalytics(orders) {
        const serviceData = {};
        orders.forEach(order => {
            const serviceName = order.service.title;
            if (!serviceData[serviceName]) {
                serviceData[serviceName] = {
                    service: serviceName,
                    orders: 0,
                    revenue: 0
                };
            }
            serviceData[serviceName].orders++;
            serviceData[serviceName].revenue += order.totalAmount;
        });
        return Object.values(serviceData).sort((a, b) => b.orders - a.orders);
    }
    calculateStatusAnalytics(orders) {
        const statusData = {};
        orders.forEach(order => {
            const status = order.status;
            if (!statusData[status]) {
                statusData[status] = {
                    status,
                    count: 0,
                    percentage: 0
                };
            }
            statusData[status].count++;
        });
        const total = orders.length;
        Object.values(statusData).forEach((item) => {
            item.percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;
        });
        return Object.values(statusData);
    }
    getValidStatusTransitions(currentStatus, role) {
        const transitions = {
            [order_status_dto_1.OrderStatus.PENDING]: role === 'PROVIDER'
                ? [order_status_dto_1.OrderStatus.ACCEPTED, order_status_dto_1.OrderStatus.CANCELLED]
                : [order_status_dto_1.OrderStatus.CANCELLED],
            [order_status_dto_1.OrderStatus.ACCEPTED]: role === 'PROVIDER'
                ? [order_status_dto_1.OrderStatus.IN_PROGRESS, order_status_dto_1.OrderStatus.COMPLETED, order_status_dto_1.OrderStatus.CANCELLED]
                : [order_status_dto_1.OrderStatus.CANCELLED],
            [order_status_dto_1.OrderStatus.IN_PROGRESS]: role === 'PROVIDER'
                ? [order_status_dto_1.OrderStatus.COMPLETED, order_status_dto_1.OrderStatus.CANCELLED]
                : [],
            [order_status_dto_1.OrderStatus.COMPLETED]: [],
            [order_status_dto_1.OrderStatus.CANCELLED]: []
        };
        return transitions[currentStatus] || [];
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map
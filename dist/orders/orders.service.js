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
        const providerPrice = providerService.price;
        const commission = service.commission;
        const quantity = createOrderDto.quantity || 1;
        const providerAmount = providerPrice * quantity;
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
                discount: 0,
                paymentStatus: 'pending'
            }
        });
        return order;
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
        if (updateStatusDto.status === order_status_dto_1.OrderStatus.COMPLETED) {
            await this.prisma.invoice.update({
                where: { orderId: id },
                data: { paymentStatus: 'paid' }
            });
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
        const [total, pending, completed, cancelled] = await Promise.all([
            this.prisma.order.count({ where }),
            this.prisma.order.count({ where: { ...where, status: 'pending' } }),
            this.prisma.order.count({ where: { ...where, status: 'completed' } }),
            this.prisma.order.count({ where: { ...where, status: 'cancelled' } })
        ]);
        return {
            total,
            pending,
            completed,
            cancelled,
            active: total - completed - cancelled
        };
    }
    getValidStatusTransitions(currentStatus, role) {
        const transitions = {
            pending: role === 'PROVIDER'
                ? [order_status_dto_1.OrderStatus.ACCEPTED, order_status_dto_1.OrderStatus.CANCELLED]
                : [order_status_dto_1.OrderStatus.CANCELLED],
            accepted: role === 'PROVIDER'
                ? [order_status_dto_1.OrderStatus.IN_PROGRESS, order_status_dto_1.OrderStatus.CANCELLED]
                : [order_status_dto_1.OrderStatus.CANCELLED],
            in_progress: role === 'PROVIDER'
                ? [order_status_dto_1.OrderStatus.COMPLETED]
                : [],
            completed: [],
            cancelled: []
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
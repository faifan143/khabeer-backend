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
exports.ProviderServiceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ProviderServiceService = class ProviderServiceService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(providerId, createProviderServiceDto) {
        const { serviceId, price, isActive = true } = createProviderServiceDto;
        if (price <= 0) {
            throw new common_1.BadRequestException('Price must be greater than 0');
        }
        const provider = await this.prisma.provider.findUnique({
            where: { id: providerId }
        });
        if (!provider) {
            throw new common_1.NotFoundException('Provider not found');
        }
        const service = await this.prisma.service.findUnique({
            where: { id: serviceId }
        });
        if (!service) {
            throw new common_1.NotFoundException('Service not found');
        }
        const existingProviderService = await this.prisma.providerService.findFirst({
            where: {
                providerId,
                serviceId
            }
        });
        if (existingProviderService) {
            throw new common_1.BadRequestException('Provider already offers this service');
        }
        const providerService = await this.prisma.providerService.create({
            data: {
                providerId,
                serviceId,
                price,
                isActive
            },
            include: {
                service: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        image: true,
                        commission: true
                    }
                }
            }
        });
        return providerService;
    }
    async findAll(providerId, activeOnly = false) {
        const where = {};
        if (providerId) {
            where.providerId = providerId;
        }
        if (activeOnly) {
            where.isActive = true;
        }
        const providerServices = await this.prisma.providerService.findMany({
            where,
            include: {
                provider: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                        isVerified: true,
                        isActive: true
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
                }
            },
            orderBy: {
                service: {
                    title: 'asc'
                }
            }
        });
        return providerServices;
    }
    async findByProvider(providerId, activeOnly = false) {
        const provider = await this.prisma.provider.findUnique({
            where: { id: providerId }
        });
        if (!provider) {
            throw new common_1.NotFoundException('Provider not found');
        }
        const where = { providerId };
        if (activeOnly) {
            where.isActive = true;
        }
        const providerServices = await this.prisma.providerService.findMany({
            where,
            include: {
                service: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        image: true,
                        commission: true
                    }
                }
            },
            orderBy: {
                service: {
                    title: 'asc'
                }
            }
        });
        return providerServices;
    }
    async findOne(id) {
        const providerService = await this.prisma.providerService.findUnique({
            where: { id },
            include: {
                provider: {
                    select: {
                        id: true,
                        name: true,
                        image: true
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
                }
            }
        });
        if (!providerService) {
            throw new common_1.NotFoundException('Provider service not found');
        }
        return providerService;
    }
    async update(id, providerId, updateProviderServiceDto) {
        const providerService = await this.prisma.providerService.findUnique({
            where: { id }
        });
        if (!providerService) {
            throw new common_1.NotFoundException('Provider service not found');
        }
        if (providerService.providerId !== providerId) {
            throw new common_1.ForbiddenException('You can only update your own services');
        }
        const { price, isActive } = updateProviderServiceDto;
        if (price !== undefined && price <= 0) {
            throw new common_1.BadRequestException('Price must be greater than 0');
        }
        const updatedProviderService = await this.prisma.providerService.update({
            where: { id },
            data: {
                ...(price !== undefined && { price }),
                ...(isActive !== undefined && { isActive })
            },
            include: {
                service: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        image: true,
                        commission: true
                    }
                }
            }
        });
        return updatedProviderService;
    }
    async remove(id, providerId) {
        const providerService = await this.prisma.providerService.findUnique({
            where: { id }
        });
        if (!providerService) {
            throw new common_1.NotFoundException('Provider service not found');
        }
        if (providerService.providerId !== providerId) {
            throw new common_1.ForbiddenException('You can only remove your own services');
        }
        const activeOrders = await this.prisma.order.findFirst({
            where: {
                providerId,
                serviceId: providerService.serviceId,
                status: {
                    in: ['pending', 'accepted', 'in_progress']
                }
            }
        });
        if (activeOrders) {
            throw new common_1.BadRequestException('Cannot remove service with active orders');
        }
        await this.prisma.providerService.delete({
            where: { id }
        });
        return { message: 'Provider service removed successfully' };
    }
    async addMultipleServices(providerId, addServicesDto) {
        const { services } = addServicesDto;
        if (!services || services.length === 0) {
            throw new common_1.BadRequestException('At least one service must be provided');
        }
        const provider = await this.prisma.provider.findUnique({
            where: { id: providerId }
        });
        if (!provider) {
            throw new common_1.NotFoundException('Provider not found');
        }
        const serviceIds = services.map(s => s.serviceId);
        const existingServices = await this.prisma.service.findMany({
            where: {
                id: { in: serviceIds }
            }
        });
        if (existingServices.length !== serviceIds.length) {
            throw new common_1.BadRequestException('One or more services not found');
        }
        const existingProviderServices = await this.prisma.providerService.findMany({
            where: {
                providerId,
                serviceId: { in: serviceIds }
            }
        });
        const existingServiceIds = existingProviderServices.map(ps => ps.serviceId);
        const newServices = services.filter(s => !existingServiceIds.includes(s.serviceId));
        if (newServices.length === 0) {
            throw new common_1.BadRequestException('All services are already offered by this provider');
        }
        const createdServices = await this.prisma.providerService.createMany({
            data: newServices.map(service => ({
                providerId,
                serviceId: service.serviceId,
                price: service.price,
                isActive: service.isActive !== false
            }))
        });
        const newProviderServices = await this.prisma.providerService.findMany({
            where: {
                providerId,
                serviceId: { in: newServices.map(s => s.serviceId) }
            },
            include: {
                service: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        image: true,
                        commission: true
                    }
                }
            }
        });
        return {
            message: `Added ${createdServices.count} new services`,
            services: newProviderServices
        };
    }
    async removeMultipleServices(providerId, serviceIds) {
        if (!serviceIds || serviceIds.length === 0) {
            throw new common_1.BadRequestException('At least one service ID must be provided');
        }
        const provider = await this.prisma.provider.findUnique({
            where: { id: providerId }
        });
        if (!provider) {
            throw new common_1.NotFoundException('Provider not found');
        }
        const activeOrders = await this.prisma.order.findFirst({
            where: {
                providerId,
                serviceId: { in: serviceIds },
                status: {
                    in: ['pending', 'accepted', 'in_progress']
                }
            }
        });
        if (activeOrders) {
            throw new common_1.BadRequestException('Cannot remove services with active orders');
        }
        const result = await this.prisma.providerService.deleteMany({
            where: {
                providerId,
                serviceId: { in: serviceIds }
            }
        });
        return {
            message: `Removed ${result.count} services`,
            removedCount: result.count
        };
    }
    async toggleServiceStatus(id, providerId) {
        const providerService = await this.prisma.providerService.findUnique({
            where: { id }
        });
        if (!providerService) {
            throw new common_1.NotFoundException('Provider service not found');
        }
        if (providerService.providerId !== providerId) {
            throw new common_1.ForbiddenException('You can only update your own services');
        }
        const updatedProviderService = await this.prisma.providerService.update({
            where: { id },
            data: {
                isActive: !providerService.isActive
            },
            include: {
                service: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        image: true,
                        commission: true
                    }
                }
            }
        });
        return updatedProviderService;
    }
    async getServiceStats(providerId) {
        const provider = await this.prisma.provider.findUnique({
            where: { id: providerId }
        });
        if (!provider) {
            throw new common_1.NotFoundException('Provider not found');
        }
        const providerServices = await this.prisma.providerService.findMany({
            where: { providerId },
            include: {
                service: true
            }
        });
        const stats = {
            totalServices: providerServices.length,
            activeServices: providerServices.filter(ps => ps.isActive).length,
            inactiveServices: providerServices.filter(ps => !ps.isActive).length,
            averagePrice: providerServices.length > 0
                ? providerServices.reduce((sum, ps) => sum + ps.price, 0) / providerServices.length
                : 0,
            services: providerServices.map(ps => ({
                id: ps.id,
                serviceId: ps.serviceId,
                serviceTitle: ps.service.title,
                price: ps.price,
                isActive: ps.isActive
            }))
        };
        return stats;
    }
};
exports.ProviderServiceService = ProviderServiceService;
exports.ProviderServiceService = ProviderServiceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProviderServiceService);
//# sourceMappingURL=provider-service.service.js.map
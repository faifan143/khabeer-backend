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
exports.ProviderJoinRequestsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ProviderJoinRequestsService = class ProviderJoinRequestsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(providerId, createJoinRequestDto) {
        const { reason, additionalInfo } = createJoinRequestDto;
        const provider = await this.prisma.provider.findUnique({
            where: { id: providerId }
        });
        if (!provider) {
            throw new common_1.NotFoundException('Provider not found');
        }
        const existingRequest = await this.prisma.providerJoinRequest.findFirst({
            where: {
                providerId,
                status: 'pending'
            }
        });
        if (existingRequest) {
            throw new common_1.BadRequestException('Provider already has a pending join request');
        }
        const approvedRequest = await this.prisma.providerJoinRequest.findFirst({
            where: {
                providerId,
                status: 'approved'
            }
        });
        if (approvedRequest) {
            throw new common_1.BadRequestException('Provider already has an approved join request');
        }
        const joinRequest = await this.prisma.providerJoinRequest.create({
            data: {
                providerId,
                status: 'pending',
                adminNotes: additionalInfo
            },
            include: {
                provider: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        description: true,
                        image: true,
                        isVerified: true,
                        isActive: true
                    }
                }
            }
        });
        return joinRequest;
    }
    async findAll(status) {
        const where = {};
        if (status) {
            where.status = status;
        }
        const joinRequests = await this.prisma.providerJoinRequest.findMany({
            where,
            include: {
                provider: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        description: true,
                        image: true,
                        isVerified: true,
                        isActive: true
                    }
                }
            },
            orderBy: {
                requestDate: 'desc'
            }
        });
        return joinRequests;
    }
    async findOne(id) {
        const joinRequest = await this.prisma.providerJoinRequest.findUnique({
            where: { id },
            include: {
                provider: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        description: true,
                        image: true,
                        isVerified: true,
                        isActive: true
                    }
                }
            }
        });
        if (!joinRequest) {
            throw new common_1.NotFoundException('Join request not found');
        }
        return joinRequest;
    }
    async findByProvider(providerId) {
        const provider = await this.prisma.provider.findUnique({
            where: { id: providerId }
        });
        if (!provider) {
            throw new common_1.NotFoundException('Provider not found');
        }
        const joinRequests = await this.prisma.providerJoinRequest.findMany({
            where: { providerId },
            include: {
                provider: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        description: true,
                        image: true,
                        isVerified: true,
                        isActive: true
                    }
                }
            },
            orderBy: {
                requestDate: 'desc'
            }
        });
        return joinRequests;
    }
    async update(id, updateJoinRequestDto) {
        const joinRequest = await this.prisma.providerJoinRequest.findUnique({
            where: { id },
            include: {
                provider: true
            }
        });
        if (!joinRequest) {
            throw new common_1.NotFoundException('Join request not found');
        }
        if (joinRequest.status !== 'pending') {
            throw new common_1.BadRequestException('Can only update pending join requests');
        }
        const { status, adminNotes } = updateJoinRequestDto;
        const updatedRequest = await this.prisma.providerJoinRequest.update({
            where: { id },
            data: {
                status,
                adminNotes
            },
            include: {
                provider: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        description: true,
                        image: true,
                        isVerified: true,
                        isActive: true
                    }
                }
            }
        });
        if (status === 'approved') {
            await this.prisma.provider.update({
                where: { id: joinRequest.providerId },
                data: {
                    isActive: true
                }
            });
        }
        return updatedRequest;
    }
    async remove(id) {
        const joinRequest = await this.prisma.providerJoinRequest.findUnique({
            where: { id }
        });
        if (!joinRequest) {
            throw new common_1.NotFoundException('Join request not found');
        }
        if (joinRequest.status !== 'pending') {
            throw new common_1.BadRequestException('Can only delete pending join requests');
        }
        await this.prisma.providerJoinRequest.delete({
            where: { id }
        });
        return { message: 'Join request deleted successfully' };
    }
    async getPendingRequests() {
        const pendingRequests = await this.prisma.providerJoinRequest.findMany({
            where: { status: 'pending' },
            include: {
                provider: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        description: true,
                        image: true,
                        isVerified: true,
                        isActive: true
                    }
                }
            },
            orderBy: {
                requestDate: 'asc'
            }
        });
        return pendingRequests;
    }
    async getRequestStats() {
        const [pending, approved, rejected] = await Promise.all([
            this.prisma.providerJoinRequest.count({ where: { status: 'pending' } }),
            this.prisma.providerJoinRequest.count({ where: { status: 'approved' } }),
            this.prisma.providerJoinRequest.count({ where: { status: 'rejected' } })
        ]);
        const total = pending + approved + rejected;
        return {
            total,
            pending,
            approved,
            rejected,
            approvalRate: total > 0 ? Math.round((approved / total) * 100) : 0
        };
    }
    async approveRequest(id, adminNotes) {
        return this.update(id, { status: 'approved', adminNotes });
    }
    async rejectRequest(id, adminNotes) {
        if (!adminNotes || adminNotes.trim() === '') {
            throw new common_1.BadRequestException('Rejection notes are required');
        }
        return this.update(id, { status: 'rejected', adminNotes });
    }
};
exports.ProviderJoinRequestsService = ProviderJoinRequestsService;
exports.ProviderJoinRequestsService = ProviderJoinRequestsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProviderJoinRequestsService);
//# sourceMappingURL=provider-join-requests.service.js.map
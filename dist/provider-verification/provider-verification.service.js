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
exports.ProviderVerificationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ProviderVerificationService = class ProviderVerificationService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(providerId, createVerificationDto) {
        const { documents, additionalInfo } = createVerificationDto;
        const provider = await this.prisma.provider.findUnique({
            where: { id: providerId }
        });
        if (!provider) {
            throw new common_1.NotFoundException('Provider not found');
        }
        const existingVerification = await this.prisma.providerVerification.findUnique({
            where: { providerId }
        });
        if (existingVerification) {
            throw new common_1.BadRequestException('Provider already has a verification request');
        }
        if (!documents || documents.length === 0) {
            throw new common_1.BadRequestException('At least one document is required');
        }
        const verification = await this.prisma.providerVerification.create({
            data: {
                providerId,
                status: 'pending',
                documents,
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
        return verification;
    }
    async findAll(status) {
        const where = {};
        if (status) {
            where.status = status;
        }
        const verifications = await this.prisma.providerVerification.findMany({
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
                createdAt: 'desc'
            }
        });
        return verifications;
    }
    async findOne(id) {
        const verification = await this.prisma.providerVerification.findUnique({
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
        if (!verification) {
            throw new common_1.NotFoundException('Verification not found');
        }
        return verification;
    }
    async findByProvider(providerId) {
        const provider = await this.prisma.provider.findUnique({
            where: { id: providerId }
        });
        if (!provider) {
            throw new common_1.NotFoundException('Provider not found');
        }
        const verification = await this.prisma.providerVerification.findUnique({
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
            }
        });
        return verification;
    }
    async update(id, updateVerificationDto) {
        const verification = await this.prisma.providerVerification.findUnique({
            where: { id },
            include: {
                provider: true
            }
        });
        if (!verification) {
            throw new common_1.NotFoundException('Verification not found');
        }
        if (verification.status !== 'pending') {
            throw new common_1.BadRequestException('Can only update pending verification requests');
        }
        const { status, adminNotes } = updateVerificationDto;
        const updatedVerification = await this.prisma.providerVerification.update({
            where: { id },
            data: {
                status,
                adminNotes,
                updatedAt: new Date()
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
                where: { id: verification.providerId },
                data: {
                    isVerified: true
                }
            });
        }
        return updatedVerification;
    }
    async remove(id) {
        const verification = await this.prisma.providerVerification.findUnique({
            where: { id }
        });
        if (!verification) {
            throw new common_1.NotFoundException('Verification not found');
        }
        if (verification.status !== 'pending') {
            throw new common_1.BadRequestException('Can only delete pending verification requests');
        }
        await this.prisma.providerVerification.delete({
            where: { id }
        });
        return { message: 'Verification request deleted successfully' };
    }
    async getPendingVerifications() {
        const pendingVerifications = await this.prisma.providerVerification.findMany({
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
                createdAt: 'asc'
            }
        });
        return pendingVerifications;
    }
    async getVerificationStats() {
        const [pending, approved, rejected] = await Promise.all([
            this.prisma.providerVerification.count({ where: { status: 'pending' } }),
            this.prisma.providerVerification.count({ where: { status: 'approved' } }),
            this.prisma.providerVerification.count({ where: { status: 'rejected' } })
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
    async approveVerification(id, adminNotes) {
        return this.update(id, { status: 'approved', adminNotes });
    }
    async rejectVerification(id, adminNotes) {
        if (!adminNotes || adminNotes.trim() === '') {
            throw new common_1.BadRequestException('Rejection notes are required');
        }
        return this.update(id, { status: 'rejected', adminNotes });
    }
    async addDocuments(id, providerId, documents) {
        const verification = await this.prisma.providerVerification.findUnique({
            where: { id }
        });
        if (!verification) {
            throw new common_1.NotFoundException('Verification not found');
        }
        if (verification.providerId !== providerId) {
            throw new common_1.ForbiddenException('You can only update your own verification');
        }
        if (verification.status !== 'pending') {
            throw new common_1.BadRequestException('Can only add documents to pending verification');
        }
        const updatedDocuments = [...verification.documents, ...documents];
        const updatedVerification = await this.prisma.providerVerification.update({
            where: { id },
            data: {
                documents: updatedDocuments,
                updatedAt: new Date()
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
        return updatedVerification;
    }
    async removeDocument(id, providerId, documentUrl) {
        const verification = await this.prisma.providerVerification.findUnique({
            where: { id }
        });
        if (!verification) {
            throw new common_1.NotFoundException('Verification not found');
        }
        if (verification.providerId !== providerId) {
            throw new common_1.ForbiddenException('You can only update your own verification');
        }
        if (verification.status !== 'pending') {
            throw new common_1.BadRequestException('Can only remove documents from pending verification');
        }
        const updatedDocuments = verification.documents.filter(doc => doc !== documentUrl);
        if (updatedDocuments.length === 0) {
            throw new common_1.BadRequestException('At least one document is required');
        }
        const updatedVerification = await this.prisma.providerVerification.update({
            where: { id },
            data: {
                documents: updatedDocuments,
                updatedAt: new Date()
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
        return updatedVerification;
    }
    async addDocumentsAdmin(providerId, documents) {
        let verification = await this.prisma.providerVerification.findUnique({
            where: { providerId }
        });
        if (!verification) {
            verification = await this.prisma.providerVerification.create({
                data: {
                    providerId,
                    status: 'pending',
                    documents: documents
                }
            });
        }
        else {
            const updatedDocuments = [...verification.documents, ...documents];
            verification = await this.prisma.providerVerification.update({
                where: { providerId },
                data: {
                    documents: updatedDocuments,
                    updatedAt: new Date()
                }
            });
        }
        return verification;
    }
    async removeDocumentAdmin(providerId, documentUrl) {
        const verification = await this.prisma.providerVerification.findUnique({
            where: { providerId }
        });
        if (!verification) {
            throw new common_1.NotFoundException('Verification not found for this provider');
        }
        const updatedDocuments = verification.documents.filter(doc => doc !== documentUrl);
        if (updatedDocuments.length === 0) {
            throw new common_1.BadRequestException('At least one document is required');
        }
        const updatedVerification = await this.prisma.providerVerification.update({
            where: { providerId },
            data: {
                documents: updatedDocuments,
                updatedAt: new Date()
            }
        });
        return updatedVerification;
    }
    async approveVerificationByProviderId(providerId, adminNotes) {
        const verification = await this.prisma.providerVerification.findUnique({
            where: { providerId }
        });
        if (!verification) {
            throw new common_1.NotFoundException('Verification not found for this provider');
        }
        const updatedVerification = await this.prisma.providerVerification.update({
            where: { providerId },
            data: {
                status: 'approved',
                adminNotes,
                updatedAt: new Date()
            }
        });
        await this.prisma.provider.update({
            where: { id: providerId },
            data: {
                isVerified: true
            }
        });
        return updatedVerification;
    }
    async rejectVerificationByProviderId(providerId, adminNotes) {
        if (!adminNotes || adminNotes.trim() === '') {
            throw new common_1.BadRequestException('Rejection notes are required');
        }
        const verification = await this.prisma.providerVerification.findUnique({
            where: { providerId }
        });
        if (!verification) {
            throw new common_1.NotFoundException('Verification not found for this provider');
        }
        const updatedVerification = await this.prisma.providerVerification.update({
            where: { providerId },
            data: {
                status: 'rejected',
                adminNotes,
                updatedAt: new Date()
            }
        });
        await this.prisma.provider.update({
            where: { id: providerId },
            data: {
                isVerified: false
            }
        });
        return updatedVerification;
    }
};
exports.ProviderVerificationService = ProviderVerificationService;
exports.ProviderVerificationService = ProviderVerificationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProviderVerificationService);
//# sourceMappingURL=provider-verification.service.js.map
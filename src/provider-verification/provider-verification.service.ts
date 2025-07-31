import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateVerificationDto {
    documents: string[];
    additionalInfo?: string;
}

export interface UpdateVerificationDto {
    status: 'pending' | 'approved' | 'rejected';
    adminNotes?: string;
}

@Injectable()
export class ProviderVerificationService {
    constructor(private readonly prisma: PrismaService) { }

    async create(providerId: number, createVerificationDto: CreateVerificationDto) {
        const { documents, additionalInfo } = createVerificationDto;

        // Check if provider exists
        const provider = await this.prisma.provider.findUnique({
            where: { id: providerId }
        });

        if (!provider) {
            throw new NotFoundException('Provider not found');
        }

        // Check if provider already has a verification request
        const existingVerification = await this.prisma.providerVerification.findUnique({
            where: { providerId }
        });

        if (existingVerification) {
            throw new BadRequestException('Provider already has a verification request');
        }

        // Validate documents
        if (!documents || documents.length === 0) {
            throw new BadRequestException('At least one document is required');
        }

        // Create verification request
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

    async findAll(status?: string) {
        const where: any = {};

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

    async findOne(id: string) {
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
            throw new NotFoundException('Verification not found');
        }

        return verification;
    }

    async findByProvider(providerId: number) {
        const provider = await this.prisma.provider.findUnique({
            where: { id: providerId }
        });

        if (!provider) {
            throw new NotFoundException('Provider not found');
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

    async update(id: string, updateVerificationDto: UpdateVerificationDto) {
        const verification = await this.prisma.providerVerification.findUnique({
            where: { id },
            include: {
                provider: true
            }
        });

        if (!verification) {
            throw new NotFoundException('Verification not found');
        }

        if (verification.status !== 'pending') {
            throw new BadRequestException('Can only update pending verification requests');
        }

        const { status, adminNotes } = updateVerificationDto;

        // Update verification
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

        // If approved, verify the provider
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

    async remove(id: string) {
        const verification = await this.prisma.providerVerification.findUnique({
            where: { id }
        });

        if (!verification) {
            throw new NotFoundException('Verification not found');
        }

        if (verification.status !== 'pending') {
            throw new BadRequestException('Can only delete pending verification requests');
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

    async approveVerification(id: string, adminNotes?: string) {
        return this.update(id, { status: 'approved', adminNotes });
    }

    async rejectVerification(id: string, adminNotes: string) {
        if (!adminNotes || adminNotes.trim() === '') {
            throw new BadRequestException('Rejection notes are required');
        }

        return this.update(id, { status: 'rejected', adminNotes });
    }

    async addDocuments(id: string, providerId: number, documents: string[]) {
        const verification = await this.prisma.providerVerification.findUnique({
            where: { id }
        });

        if (!verification) {
            throw new NotFoundException('Verification not found');
        }

        if (verification.providerId !== providerId) {
            throw new ForbiddenException('You can only update your own verification');
        }

        if (verification.status !== 'pending') {
            throw new BadRequestException('Can only add documents to pending verification');
        }

        // Merge existing documents with new ones
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

    async removeDocument(id: string, providerId: number, documentUrl: string) {
        const verification = await this.prisma.providerVerification.findUnique({
            where: { id }
        });

        if (!verification) {
            throw new NotFoundException('Verification not found');
        }

        if (verification.providerId !== providerId) {
            throw new ForbiddenException('You can only update your own verification');
        }

        if (verification.status !== 'pending') {
            throw new BadRequestException('Can only remove documents from pending verification');
        }

        // Remove the document from the array
        const updatedDocuments = verification.documents.filter(doc => doc !== documentUrl);

        if (updatedDocuments.length === 0) {
            throw new BadRequestException('At least one document is required');
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
} 
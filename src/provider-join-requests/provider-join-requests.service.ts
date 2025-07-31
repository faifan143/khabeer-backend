import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateJoinRequestDto {
  providerId: number;
  reason?: string;
  additionalInfo?: string;
}

export interface UpdateJoinRequestDto {
  status: 'pending' | 'approved' | 'rejected';
  adminNotes?: string;
}

@Injectable()
export class ProviderJoinRequestsService {
  constructor(private readonly prisma: PrismaService) { }

  async create(providerId: number, createJoinRequestDto: CreateJoinRequestDto) {
    const { reason, additionalInfo } = createJoinRequestDto;

    // Check if provider exists
    const provider = await this.prisma.provider.findUnique({
      where: { id: providerId }
    });

    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    // Check if provider already has a pending request
    const existingRequest = await this.prisma.providerJoinRequest.findFirst({
      where: {
        providerId,
        status: 'pending'
      }
    });

    if (existingRequest) {
      throw new BadRequestException('Provider already has a pending join request');
    }

    // Check if provider already has an approved request
    const approvedRequest = await this.prisma.providerJoinRequest.findFirst({
      where: {
        providerId,
        status: 'approved'
      }
    });

    if (approvedRequest) {
      throw new BadRequestException('Provider already has an approved join request');
    }

    // Create join request
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

  async findAll(status?: string) {
    const where: any = {};

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

  async findOne(id: number) {
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
      throw new NotFoundException('Join request not found');
    }

    return joinRequest;
  }

  async findByProvider(providerId: number) {
    const provider = await this.prisma.provider.findUnique({
      where: { id: providerId }
    });

    if (!provider) {
      throw new NotFoundException('Provider not found');
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

  async update(id: number, updateJoinRequestDto: UpdateJoinRequestDto) {
    const joinRequest = await this.prisma.providerJoinRequest.findUnique({
      where: { id },
      include: {
        provider: true
      }
    });

    if (!joinRequest) {
      throw new NotFoundException('Join request not found');
    }

    if (joinRequest.status !== 'pending') {
      throw new BadRequestException('Can only update pending join requests');
    }

    const { status, adminNotes } = updateJoinRequestDto;

    // Update join request
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

    // If approved, activate the provider
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

  async remove(id: number) {
    const joinRequest = await this.prisma.providerJoinRequest.findUnique({
      where: { id }
    });

    if (!joinRequest) {
      throw new NotFoundException('Join request not found');
    }

    if (joinRequest.status !== 'pending') {
      throw new BadRequestException('Can only delete pending join requests');
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

  async approveRequest(id: number, adminNotes?: string) {
    return this.update(id, { status: 'approved', adminNotes });
  }

  async rejectRequest(id: number, adminNotes: string) {
    if (!adminNotes || adminNotes.trim() === '') {
      throw new BadRequestException('Rejection notes are required');
    }

    return this.update(id, { status: 'rejected', adminNotes });
  }
}

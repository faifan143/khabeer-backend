import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUpdateAuditDto } from './dto/create-update-audit.dto';
import { UpdateUpdateAuditDto } from './dto/update-update-audit.dto';

@Injectable()
export class UpdateAuditService {
    constructor(private prisma: PrismaService) { }

    async create(createUpdateAuditDto: CreateUpdateAuditDto) {
        return this.prisma.updateAudit.create({
            data: createUpdateAuditDto,
        });
    }

    async findAll() {
        return this.prisma.updateAudit.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: number) {
        return this.prisma.updateAudit.findUnique({
            where: { id },
        });
    }

    async findByVersion(version: string) {
        return this.prisma.updateAudit.findUnique({
            where: { version },
        });
    }

    async update(id: number, updateUpdateAuditDto: UpdateUpdateAuditDto) {
        return this.prisma.updateAudit.update({
            where: { id },
            data: updateUpdateAuditDto,
        });
    }

    async remove(id: number) {
        return this.prisma.updateAudit.delete({
            where: { id },
        });
    }

    async getLatestVersion() {
        const updateAudit = await this.prisma.updateAudit.findFirst({
            orderBy: { createdAt: 'desc' },
        });
        return updateAudit?.requiresUpdate || false;
    }

    async getVersionRequiresUpdate(version: string) {
        const updateAudit = await this.findByVersion(version);
        return updateAudit?.requiresUpdate || false;
    }
}

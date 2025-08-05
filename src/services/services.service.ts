import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) { }

  async findAll() {
    return this.prisma.service.findMany();
  }

  async findByCategory(categoryId: number) {
    return this.prisma.service.findMany({
      where: { categoryId },
      include: {
        category: true
      }
    });
  }

  async findById(id: number) {
    return this.prisma.service.findUnique({ where: { id } });
  }

  async create(data: CreateServiceDto & { image: string }) {
    return this.prisma.service.create({ data });
  }

  async update(id: number, data: UpdateServiceDto & { image?: string }) {
    return this.prisma.service.update({ where: { id }, data });
  }

  async remove(id: number) {
    // Use a transaction to handle cascade deletion properly
    return this.prisma.$transaction(async (tx) => {
      // First, delete all related invoices (they reference orders)
      await tx.invoice.deleteMany({
        where: {
          order: {
            serviceId: id
          }
        }
      });

      // Then delete all related orders
      await tx.order.deleteMany({
        where: { serviceId: id }
      });

      // Then delete all related provider services
      await tx.providerService.deleteMany({
        where: { serviceId: id }
      });

      // Then delete all related offers
      await tx.offer.deleteMany({
        where: { serviceId: id }
      });

      // Finally delete the service
      return tx.service.delete({
        where: { id }
      });
    });
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) { }

  async findAll() {
    return this.prisma.category.findMany();
  }

  async findById(id: number) {
    return this.prisma.category.findUnique({ where: { id } });
  }

  async create(data: CreateCategoryDto & { image: string }) {
    return this.prisma.category.create({ data });
  }

  async update(id: number, data: UpdateCategoryDto & { image?: string }) {
    return this.prisma.category.update({ where: { id }, data });
  }

  async remove(id: number) {
    // Use a transaction to handle cascade deletion properly
    return this.prisma.$transaction(async (tx) => {
      // First, get all services in this category
      const services = await tx.service.findMany({
        where: { categoryId: id },
        select: { id: true }
      });

      const serviceIds = services.map(s => s.id);

      // Delete all related records for services in this category
      if (serviceIds.length > 0) {
        // First, delete all related invoices (they reference orders)
        await tx.invoice.deleteMany({
          where: {
            order: {
              serviceId: { in: serviceIds }
            }
          }
        });

        // Then delete all related orders
        await tx.order.deleteMany({
          where: { serviceId: { in: serviceIds } }
        });

        // Delete all related provider services
        await tx.providerService.deleteMany({
          where: { serviceId: { in: serviceIds } }
        });

        // Delete all related offers
        await tx.offer.deleteMany({
          where: { serviceId: { in: serviceIds } }
        });
      }

      // Delete all services in this category
      await tx.service.deleteMany({
        where: { categoryId: id }
      });

      // Finally delete the category
      return tx.category.delete({
        where: { id }
      });
    });
  }
}

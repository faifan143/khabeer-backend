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

  async create(data: CreateServiceDto) {
    return this.prisma.service.create({ data });
  }

  async update(id: number, data: UpdateServiceDto) {
    return this.prisma.service.update({ where: { id }, data });
  }

  async remove(id: number) {
    return this.prisma.service.delete({ where: { id } });
  }
}

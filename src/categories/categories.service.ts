import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.category.findMany();
  }

  async findById(id: number) {
    return this.prisma.category.findUnique({ where: { id } });
  }

  async create(data: CreateCategoryDto) {
    return this.prisma.category.create({ data });
  }

  async update(id: number, data: UpdateCategoryDto) {
    return this.prisma.category.update({ where: { id }, data });
  }

  async remove(id: number) {
    return this.prisma.category.delete({ where: { id } });
  }
}

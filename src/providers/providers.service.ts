import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';

@Injectable()
export class ProvidersService {
  constructor(private readonly prisma: PrismaService) { }

  async findAll() {
    return this.prisma.provider.findMany();
  }

  async findById(id: number) {
    return this.prisma.provider.findUnique({ where: { id } });
  }

  async create(data: CreateProviderDto) {
    return this.prisma.provider.create({ data });
  }

  async registerProviderWithServices(data: CreateProviderDto) {
    const { serviceIds, ...providerData } = data;
    return this.prisma.provider.create({
      data: {
        ...providerData,
        providerServices: {
          create: serviceIds.map(serviceId => ({ serviceId }))
        }
      },
      include: { providerServices: true }
    });
  }

  async update(id: number, data: UpdateProviderDto) {
    return this.prisma.provider.update({ where: { id }, data });
  }

  async remove(id: number) {
    return this.prisma.provider.delete({ where: { id } });
  }
}

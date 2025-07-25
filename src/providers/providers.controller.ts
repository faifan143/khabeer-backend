import { Controller, Get, Param, Body, Post, Put, Delete, UseGuards, Request, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from '../files/files.service';
import { ProvidersService } from './providers.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';

@Controller('providers')
export class ProvidersController {
  constructor(
    private readonly providersService: ProvidersService,
    private readonly filesService: FilesService
  ) { }

  @Get()
  async findAll() {
    return this.providersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.providersService.findById(Number(id));
  }



  @Post('register')
  @UseInterceptors(FileInterceptor('image'))
  async register(
    @Body() data: CreateProviderDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    data.image = file ? await this.filesService.handleUploadedFile(file) : '';
    // Parse serviceIds if it's a string or array of strings
    if (typeof data.serviceIds === 'string') {
      data.serviceIds = [parseInt(data.serviceIds, 10)];
    } else if (Array.isArray(data.serviceIds)) {
      data.serviceIds = data.serviceIds.map(id => typeof id === 'string' ? parseInt(id, 10) : id);
    }
    if (!data.serviceIds) data.serviceIds = [];
    data.name = data.name || '';
    data.description = data.description || '';
    data.state = data.state || '';
    data.phone = data.phone || '';
    return this.providersService.registerProviderWithServices(data);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async create(@Body() data: CreateProviderDto) {
    return this.providersService.create(data);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async update(@Param('id') id: string, @Body() data: UpdateProviderDto) {
    return this.providersService.update(Number(id), data);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async remove(@Param('id') id: string) {
    return this.providersService.remove(Number(id));
  }

  @Get(':id/services')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PROVIDER', 'ADMIN')
  async getProviderServices(@Param('id') id: string, @Request() req) {
    // Providers can only access their own services, admins can access any
    if (req.user.role === 'PROVIDER' && req.user.id !== Number(id)) {
      throw new BadRequestException('You can only access your own services');
    }
    return this.providersService.getProviderServices(Number(id));
  }

  @Post(':id/services')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PROVIDER', 'ADMIN')
  async addServices(
    @Param('id') id: string,
    @Body() body: { serviceIds: number[] },
    @Request() req
  ) {
    // Providers can only modify their own services, admins can modify any
    if (req.user.role === 'PROVIDER' && req.user.id !== Number(id)) {
      throw new BadRequestException('You can only modify your own services');
    }
    return this.providersService.addServices(Number(id), body.serviceIds);
  }

  @Delete(':id/services')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PROVIDER', 'ADMIN')
  async removeServices(
    @Param('id') id: string,
    @Body() body: { serviceIds: number[] },
    @Request() req
  ) {
    // Providers can only modify their own services, admins can modify any
    if (req.user.role === 'PROVIDER' && req.user.id !== Number(id)) {
      throw new BadRequestException('You can only modify your own services');
    }
    return this.providersService.removeServices(Number(id), body.serviceIds);
  }
}


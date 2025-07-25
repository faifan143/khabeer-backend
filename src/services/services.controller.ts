import { Controller, Get, Param, Body, Post, Put, Delete, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from '../files/files.service';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Controller('services')
export class ServicesController {
  constructor(
    private readonly servicesService: ServicesService,
    private readonly filesService: FilesService
  ) { }

  @Get()
  async findAll() {
    return this.servicesService.findAll();
  }

  @Get('category/:categoryId')
  async findByCategory(@Param('categoryId') categoryId: string) {
    return this.servicesService.findByCategory(Number(categoryId));
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.servicesService.findById(Number(id));
  }

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async create(@Body() data: CreateServiceDto, @UploadedFile() file: Express.Multer.File) {
    data.image = file ? await this.filesService.handleUploadedFile(file) : '';
    return this.servicesService.create(data);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: UpdateServiceDto) {
    return this.servicesService.update(Number(id), data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.servicesService.remove(Number(id));
  }
}


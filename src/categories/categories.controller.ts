import { Controller, Get, Param, Body, Post, Put, Delete, UseGuards, Request, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from '../files/files.service';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly filesService: FilesService
  ) {}

  @Get()
  async findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.categoriesService.findById(Number(id));
  }

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async create(@Body() data: CreateCategoryDto, @UploadedFile() file: Express.Multer.File) {
    data.image = file ? await this.filesService.handleUploadedFile(file) : '';
    return this.categoriesService.create(data);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: UpdateCategoryDto) {
    return this.categoriesService.update(Number(id), data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.categoriesService.remove(Number(id));
  }
}


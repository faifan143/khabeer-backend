import { Controller, Get, Param, Body, Post, Put, Delete, UseGuards, Request, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from '../files/files.service';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ComprehensiveAuthGuard } from '../auth/comprehensive-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { Public } from 'src/auth/public.decorator';

@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly filesService: FilesService
  ) { }

  @Get('public')
  @Public()
  async findAllPublic() {
    return this.categoriesService.findAllPublic();
  }

  @Get()
  @UseGuards(JwtAuthGuard, ComprehensiveAuthGuard)
  @Roles('USER', 'PROVIDER', 'ADMIN')
  async findAll(@Request() req) {
    const userState = req.user.state;
    return this.categoriesService.findAll(userState);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, ComprehensiveAuthGuard)
  @Roles('USER', 'PROVIDER', 'ADMIN')
  async findOne(@Param('id') id: string) {
    return this.categoriesService.findById(Number(id));
  }

  @Post()
  @UseGuards(JwtAuthGuard, ComprehensiveAuthGuard)
  @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        cb(null, `${uniqueSuffix}${ext}`);
      },
    }),
  }))
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    const data = { ...createCategoryDto, image: '' };
    if (file) {
      const fileResult = await this.filesService.handleUploadedFile(file);
      data.image = fileResult.url;
    }
    return this.categoriesService.create(data);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, ComprehensiveAuthGuard)
  @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        cb(null, `${uniqueSuffix}${ext}`);
      },
    }),
  }))
  async update(
    @Param('id') id: string,
    @Body() data: UpdateCategoryDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    const updateData: any = { ...data };
    if (file) {
      const fileResult = await this.filesService.handleUploadedFile(file);
      updateData.image = fileResult.url;
    }
    // If no file provided, don't update the image field (preserve existing)
    return this.categoriesService.update(Number(id), updateData);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, ComprehensiveAuthGuard)
  @Roles('ADMIN')
  async remove(@Param('id') id: string) {
    return this.categoriesService.remove(Number(id));
  }
}


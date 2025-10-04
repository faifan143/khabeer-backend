import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Roles } from '../auth/roles.decorator';
import { ComprehensiveAuthGuard } from '../auth/comprehensive-auth.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FilesService } from '../files/files.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { CreateBulkServiceDto } from './dto/create-bulk-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServicesService } from './services.service';

@Controller('services')
export class ServicesController {
  constructor(
    private readonly servicesService: ServicesService,
    private readonly filesService: FilesService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard, ComprehensiveAuthGuard)
  @Roles('USER', 'PROVIDER', 'ADMIN')
  async findAll(@Request() req?: any) {
    const userState = req?.user?.state;
    const userRole = req?.user?.role;
    const userId = req?.user?.userId;
    return this.servicesService.findAll(userState, userRole, userId);
  }

  @Get('public')
  // Public endpoint - no authentication required
  async findAllPublic() {
    return this.servicesService.findAllPublic();
  }

  @Get('category/:categoryId')
  @UseGuards(JwtAuthGuard, ComprehensiveAuthGuard)
  @Roles('USER', 'PROVIDER', 'ADMIN')
  async findByCategory(
    @Param('categoryId') categoryId: string,
    @Request() req,
  ) {
    const userState = req.user.state;
    const userRole = req.user.role;
    console.log('[category/:id]', {
      userState,
      userRole,
      categoryId,
    });

    return this.servicesService.findByCategory(
      Number(categoryId),
      userState,
      userRole,
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, ComprehensiveAuthGuard)
  @Roles('USER', 'PROVIDER', 'ADMIN')
  async findOne(@Param('id') id: string) {
    return this.servicesService.findById(Number(id));
  }

  @Post()
  @UseGuards(JwtAuthGuard, ComprehensiveAuthGuard)
  @Roles('ADMIN')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  async create(
    @Body() createServiceDto: CreateServiceDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const data = { ...createServiceDto, image: '' };
    if (file) {
      const fileResult = await this.filesService.handleUploadedFile(file);
      data.image = fileResult.url;
    }
    return this.servicesService.create(data);
  }

  /**
   * Create services for multiple categories at once
   *
   * @example
   * POST /services/bulk
   * Body: {
   *   "titleAr": "خدمة الصيانة",
   *   "titleEn": "Maintenance Service",
   *   "description": "Professional maintenance services",
   *   "commission": 10,
   *   "serviceType": "NORMAL",
   *   "categoryIds": [1, 2, 3]
   * }
   * FormData: image file (optional)
   *
   * This will create 3 separate services, one for each category
   */
  @Post('bulk')
  @UseGuards(JwtAuthGuard, ComprehensiveAuthGuard)
  @Roles('ADMIN')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  async createBulk(
    @Body() createBulkServiceDto: CreateBulkServiceDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const data = { ...createBulkServiceDto, image: '' };
    if (file) {
      const fileResult = await this.filesService.handleUploadedFile(file);
      data.image = fileResult.url;
    }
    return this.servicesService.createBulk(data);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, ComprehensiveAuthGuard)
  @Roles('ADMIN')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  async update(
    @Param('id') id: string,
    @Body() data: UpdateServiceDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const updateData: any = { ...data };
    if (file) {
      const fileResult = await this.filesService.handleUploadedFile(file);
      updateData.image = fileResult.url;
    }
    // If no file provided, don't update the image field (preserve existing)
    return this.servicesService.update(Number(id), updateData);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, ComprehensiveAuthGuard)
  @Roles('ADMIN')
  async remove(@Param('id') id: string) {
    return this.servicesService.remove(Number(id));
  }
}

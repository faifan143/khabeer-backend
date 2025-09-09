import { Controller, Get, Param, Body, Post, Put, Delete, UseGuards, Request, UploadedFile, UseInterceptors, BadRequestException, ParseIntPipe, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from '../files/files.service';
import { ProvidersService } from './providers.service';
import { ComprehensiveAuthGuard } from '../auth/comprehensive-auth.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { ProvidersByServiceResponseDto } from './dto/providers-by-service-response.dto';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('providers')
@UseGuards(JwtAuthGuard, ComprehensiveAuthGuard)
export class ProvidersController {
  constructor(
    private readonly providersService: ProvidersService,
    private readonly filesService: FilesService
  ) { }

  @Get()
  @Roles('USER', 'PROVIDER', 'ADMIN')
  async findAll() {
    return this.providersService.findAll();
  }

  @Get('service/:serviceId')
  @Roles('USER', 'PROVIDER', 'ADMIN')
  async getProvidersByService(@Param('serviceId') serviceId: string): Promise<ProvidersByServiceResponseDto> {
    const serviceIdNum = Number(serviceId);
    if (isNaN(serviceIdNum) || serviceIdNum <= 0) {
      throw new BadRequestException('Invalid service ID. Must be a positive number.');
    }
    return this.providersService.findProvidersByServiceId(serviceIdNum);
  }

  @Get('profile')
  @Roles('PROVIDER')
  async getProfile(@Request() req) {
    return this.providersService.getProfile(req.user.userId);
  }

  @Get(':id')
  @Roles('USER', 'PROVIDER', 'ADMIN')
  async findOne(@Param('id') id: string) {
    return this.providersService.findById(Number(id));
  }

  @Get(':id/full-details')
  @Roles('USER', 'PROVIDER', 'ADMIN')
  async getProviderFullDetails(@Param('id', ParseIntPipe) id: number) {
    return this.providersService.getProviderFullDetails(id);
  }

  @Get(':id/status')
  @Roles('PROVIDER', 'ADMIN')
  async getStatus(@Param('id') id: string, @Request() req) {
    // Providers can only access their own status, admins can access any
    if (req.user.role === 'PROVIDER' && req.user.userId !== Number(id)) {
      throw new BadRequestException('You can only access your own status');
    }
    const provider = await this.providersService.findById(Number(id));
    return { isActive: provider.isActive };
  }


  @Post('register')
  @Roles('USER', 'ADMIN')
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './uploads/images/providers',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        cb(null, `provider-${uniqueSuffix}${ext}`);
      },
    }),
  }))
  async register(
    @Body() data: CreateProviderDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    if (file) {
      const options = {
        maxSize: 5 * 1024 * 1024, // 5MB for images
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif'],
        allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif']
      };
      const fileResult = await this.filesService.handleUploadedFile(file, options);
      data.image = fileResult.url;
    } else {
      data.image = '';
    }
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
  @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './uploads/images/providers',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        cb(null, `provider-${uniqueSuffix}${ext}`);
      },
    }),
  }))
  async create(
    @Body() createProviderDto: CreateProviderDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    const data = { ...createProviderDto };
    if (file) {
      const options = {
        maxSize: 5 * 1024 * 1024, // 5MB for images
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif'],
        allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif']
      };
      const fileResult = await this.filesService.handleUploadedFile(file, options);
      data.image = fileResult.url;
    } else {
      data.image = '';
    }
    return this.providersService.create(data);
  }

  @Put(':id')
  @Roles('PROVIDER', 'ADMIN')
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        cb(null, `provider-${uniqueSuffix}${ext}`);
      },
    }),
  }))
  async update(
    @Param('id') id: string,
    @Body() data: UpdateProviderDto,
    @UploadedFile() file: Express.Multer.File,
    @Request() req
  ) {
    // Providers can only update their own information, admins can update any
    if (req.user.role === 'PROVIDER' && req.user.userId !== Number(id)) {
      throw new BadRequestException('You can only update your own information');
    }

    const updateData = { ...data };
    if (file) {
      const options = {
        maxSize: 5 * 1024 * 1024, // 5MB for images
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif'],
        allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif']
      };
      const fileResult = await this.filesService.handleUploadedFile(file, options);
      updateData.image = fileResult.url;
    }
    return this.providersService.update(Number(id), updateData);
  }

  @Put(':id/status')
  @Roles('PROVIDER', 'ADMIN')
  async updateStatus(
    @Param('id') id: string,
    @Body() data: UpdateStatusDto,
    @Request() req
  ) {
    // Providers can only update their own status, admins can update any
    if (req.user.role === 'PROVIDER' && req.user.userId !== Number(id)) {
      throw new BadRequestException('You can only update your own status');
    }
    return this.providersService.updateStatus(Number(id), data.isActive);
  }

  @Delete(':id')
  @Roles('ADMIN')
  async remove(@Param('id') id: string) {
    return this.providersService.remove(Number(id));
  }

  @Get(':id/services')
  @Roles('PROVIDER', 'ADMIN')
  async getProviderServices(@Param('id') id: string, @Request() req) {
    // Providers can only access their own services, admins can access any
    if (req.user.role === 'PROVIDER' && req.user.userId !== Number(id)) {
      throw new BadRequestException('You can only access your own services');
    }
    return this.providersService.getProviderServices(Number(id));
  }

  @Get(':id/categories/:categoryId/services')
  @Roles('PROVIDER', 'ADMIN')
  async getCategoryServicesByProviderId(
    @Param('id', ParseIntPipe) providerId: number,
    @Param('categoryId', ParseIntPipe) categoryId: number
  ) {
    return this.providersService.getCategoryServicesByProviderId(providerId, categoryId);
  }

  @Post(':id/services')
  @Roles('PROVIDER', 'ADMIN')
  async addServices(
    @Param('id') id: string,
    @Body() body: { serviceIds: number[] },
    @Request() req
  ) {
    // Providers can only modify their own services, admins can modify any
    if (req.user.role === 'PROVIDER' && req.user.userId !== Number(id)) {
      throw new BadRequestException('You can only modify your own services');
    }
    return this.providersService.addServices(Number(id), body.serviceIds);
  }

  @Delete(':id/services')
  @Roles('PROVIDER', 'ADMIN')
  async removeServices(
    @Param('id') id: string,
    @Body() body: { serviceIds: number[] },
    @Request() req
  ) {
    // Providers can only modify their own services, admins can modify any
    if (req.user.role === 'PROVIDER' && req.user.userId !== Number(id)) {
      throw new BadRequestException('You can only modify your own services');
    }
    return this.providersService.removeServices(Number(id), body.serviceIds);
  }

  @Get(':id/orders')
  @Roles('PROVIDER', 'ADMIN')
  async getProviderOrders(@Param('id') id: string, @Request() req) {
    // Providers can only access their own orders, admins can access any
    if (req.user.role === 'PROVIDER' && req.user.userId !== Number(id)) {
      throw new BadRequestException('You can only access your own orders');
    }
    return this.providersService.getProviderOrders(Number(id));
  }

  @Get(':id/orders/pending')
  @Roles('PROVIDER', 'ADMIN')
  async getProviderPendingOrders(@Param('id') id: string, @Request() req) {
    // Providers can only access their own orders, admins can access any
    if (req.user.role === 'PROVIDER' && req.user.userId !== Number(id)) {
      throw new BadRequestException('You can only access your own orders');
    }
    return this.providersService.getProviderPendingOrders(Number(id));
  }

  @Get(':id/orders/pending/count')
  @Roles('PROVIDER', 'ADMIN')
  async getProviderPendingOrdersCount(@Param('id') id: string, @Request() req) {
    // Providers can only access their own orders, admins can access any
    if (req.user.role === 'PROVIDER' && req.user.userId !== Number(id)) {
      throw new BadRequestException('You can only access your own orders');
    }
    return this.providersService.getProviderPendingOrdersCount(Number(id));
  }

  @Get(':id/orders/:status')
  @Roles('PROVIDER', 'ADMIN')
  async getProviderOrdersByStatus(
    @Param('id') id: string,
    @Param('status') status: string,
    @Request() req
  ) {
    // Providers can only access their own orders, admins can access any
    if (req.user.role === 'PROVIDER' && req.user.userId !== Number(id)) {
      throw new BadRequestException('You can only access your own orders');
    }
    return this.providersService.getProviderOrdersByStatus(Number(id), status);
  }

  @Get(':id/ratings')
  @Roles('PROVIDER', 'ADMIN')
  async getProviderRatings(@Param('id') id: string, @Request() req) {
    // Providers can only access their own ratings, admins can access any
    if (req.user.role === 'PROVIDER' && req.user.userId !== Number(id)) {
      throw new BadRequestException('You can only access your own ratings');
    }
    return this.providersService.getProviderRatings(Number(id));
  }

  @Get(':id/documents')
  @Roles('PROVIDER', 'ADMIN')
  async getProviderDocuments(@Param('id') id: string, @Request() req) {
    // Providers can only access their own documents, admins can access any
    if (req.user.role === 'PROVIDER' && req.user.userId !== Number(id)) {
      throw new BadRequestException('You can only access your own documents');
    }
    return this.providersService.getProviderDocuments(Number(id));
  }

  @Get('top/comprehensive')
  async getTopProviders(
    @Query('limit') limit?: string,
    @Query('minRating') minRating?: string,
    @Query('minOrders') minOrders?: string,
    @Query('includeUnrated') includeUnrated?: string
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    const minRatingNum = minRating ? parseFloat(minRating) : 0;
    const minOrdersNum = minOrders ? parseInt(minOrders, 10) : 0;
    const includeUnratedBool = includeUnrated !== 'false'; // Default to true

    // Validate parameters
    if (limitNum < 1 || limitNum > 100) {
      throw new BadRequestException('Limit must be between 1 and 100');
    }

    if (minRatingNum < 0 || minRatingNum > 5) {
      throw new BadRequestException('Minimum rating must be between 0 and 5');
    }

    if (minOrdersNum < 0) {
      throw new BadRequestException('Minimum orders must be non-negative');
    }

    return this.providersService.getTopProviders(
      limitNum,
      minRatingNum,
      minOrdersNum,
      includeUnratedBool
    );
  }
}


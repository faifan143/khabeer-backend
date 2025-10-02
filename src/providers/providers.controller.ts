import {
  Controller,
  Get,
  Param,
  Body,
  Post,
  Put,
  Delete,
  UseGuards,
  Request,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  ParseIntPipe,
  Query,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { FilesService } from '../files/files.service';
import { ProvidersService } from './providers.service';
import { ComprehensiveAuthGuard } from '../auth/comprehensive-auth.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { UpdateOnlineStatusDto } from './dto/update-online-status.dto';
import {
  ChangePhoneRequestDto,
  VerifyPhoneChangeDto,
  PhoneChangeResponseDto,
} from './dto/change-phone.dto';
import {
  DeleteAccountDto,
  DeleteAccountResponseDto,
  DeleteAccountErrorResponseDto,
} from './dto/delete-account.dto';
import { ProvidersByServiceResponseDto } from './dto/providers-by-service-response.dto';
import { diskStorage } from 'multer';
import { extname } from 'path';

@ApiTags('Providers')
@ApiBearerAuth()
@Controller('providers')
@UseGuards(JwtAuthGuard, ComprehensiveAuthGuard)
export class ProvidersController {
  constructor(
    private readonly providersService: ProvidersService,
    private readonly filesService: FilesService,
  ) {}

  @Get()
  @Roles('USER', 'PROVIDER', 'ADMIN')
  async findAll(@Request() req) {
    const userRole = req.user.role;
    return this.providersService.findAll(userRole);
  }

  @Get('service/:serviceId')
  @Roles('USER', 'PROVIDER', 'ADMIN')
  async getProvidersByService(
    @Param('serviceId') serviceId: string,
    @Request() req,
  ): Promise<ProvidersByServiceResponseDto> {
    const serviceIdNum = Number(serviceId);
    if (isNaN(serviceIdNum) || serviceIdNum <= 0) {
      throw new BadRequestException(
        'Invalid service ID. Must be a positive number.',
      );
    }
    const userRole = req.user.role;
    return this.providersService.findProvidersByServiceId(
      serviceIdNum,
      userRole,
    );
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
  @Roles('PROVIDER', 'ADMIN', 'USER')
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
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/images/providers',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `provider-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  async register(
    @Body() data: CreateProviderDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (file) {
      const options = {
        maxSize: 5 * 1024 * 1024, // 5MB for images
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif'],
        allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif'],
      };
      const fileResult = await this.filesService.handleUploadedFile(
        file,
        options,
      );
      data.image = fileResult.url;
    } else {
      data.image = '';
    }
    // Handle categoryIds
    if (data.categoryIds && data.categoryIds.length > 0) {
      if (typeof data.categoryIds === 'string') {
        data.categoryIds = [parseInt(data.categoryIds, 10)];
      } else if (Array.isArray(data.categoryIds)) {
        data.categoryIds = data.categoryIds.map((id) =>
          typeof id === 'string' ? parseInt(id, 10) : id,
        );
      }
    }

    // If no categories provided, default to empty array
    if (!data.categoryIds) data.categoryIds = [];
    data.name = data.name || '';
    data.description = data.description || '';
    data.state = data.state || '';
    data.phone = data.phone || '';
    return this.providersService.registerProviderWithCategories(data);
  }

  @Post()
  @Roles('ADMIN')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/images/providers',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `provider-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  async create(
    @Body() createProviderDto: CreateProviderDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const data = { ...createProviderDto };
    if (file) {
      const options = {
        maxSize: 5 * 1024 * 1024, // 5MB for images
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif'],
        allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif'],
      };
      const fileResult = await this.filesService.handleUploadedFile(
        file,
        options,
      );
      data.image = fileResult.url;
    } else {
      data.image = '';
    }
    return this.providersService.create(data);
  }

  @Get('online-status')
  @Roles('PROVIDER', 'ADMIN', 'USER')
  async getOnlineStatus(@Request() req) {
    // Get provider ID from JWT token
    const providerId = req.user.userId;
    const provider = await this.providersService.getOnlineStatus(providerId);
    return { onlineStatus: provider.onlineStatus };
  }

  @Put('online-status')
  @Roles('PROVIDER', 'ADMIN', 'USER')
  async updateOnlineStatus(
    @Body() data: UpdateOnlineStatusDto,
    @Request() req,
  ) {
    // Get provider ID from JWT token
    const providerId = req.user.userId;
    return this.providersService.updateOnlineStatus(
      providerId,
      data.onlineStatus,
    );
  }

  @Put(':id')
  @Roles('PROVIDER', 'ADMIN', 'USER')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `provider-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  async update(
    @Param('id') id: string,
    @Body() data: UpdateProviderDto,
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
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
        allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif'],
      };
      const fileResult = await this.filesService.handleUploadedFile(
        file,
        options,
      );
      updateData.image = fileResult.url;
    }
    return this.providersService.update(Number(id), updateData);
  }

  @Put(':id/status')
  @Roles('PROVIDER', 'ADMIN', 'USER')
  async updateStatus(
    @Param('id') id: string,
    @Body() data: UpdateStatusDto,
    @Request() req,
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
  @Roles('PROVIDER', 'ADMIN', 'USER')
  async getProviderServices(@Param('id') id: string, @Request() req) {
    // Providers can only access their own services, admins can access any
    if (req.user.role === 'PROVIDER' && req.user.userId !== Number(id)) {
      throw new BadRequestException('You can only access your own services');
    }
    return this.providersService.getProviderServices(Number(id));
  }

  @Get(':id/categories')
  @Roles('PROVIDER', 'ADMIN')
  async getProviderCategories(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ) {
    // Check if user is the provider or admin
    if (req.user.role !== 'ADMIN' && req.user.userId !== id) {
      throw new ForbiddenException('Access denied');
    }

    return this.providersService.getProviderCategories(id);
  }

  @Post(':id/categories')
  @Roles('PROVIDER', 'ADMIN')
  async addProviderCategories(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { categoryIds: number[] },
    @Request() req,
  ) {
    // Check if user is the provider or admin
    if (req.user.role !== 'ADMIN' && req.user.userId !== id) {
      throw new ForbiddenException('Access denied');
    }

    return this.providersService.addProviderCategories(id, body.categoryIds);
  }

  @Delete(':id/categories')
  @Roles('PROVIDER', 'ADMIN')
  async removeProviderCategories(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { categoryIds: number[] },
    @Request() req,
  ) {
    // Check if user is the provider or admin
    if (req.user.role !== 'ADMIN' && req.user.userId !== id) {
      throw new ForbiddenException('Access denied');
    }

    return this.providersService.removeProviderCategories(id, body.categoryIds);
  }

  @Get(':id/services-by-categories')
  @Roles('PROVIDER', 'ADMIN')
  async getServicesByProviderCategories(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ) {
    // Check if user is the provider or admin
    if (req.user.role !== 'ADMIN' && req.user.userId !== id) {
      throw new ForbiddenException('Access denied');
    }

    return this.providersService.getServicesByProviderCategories(id);
  }

  @Get(':id/categories/:categoryId/services')
  @Roles('PROVIDER', 'ADMIN', 'USER')
  async getCategoryServicesByProviderId(
    @Param('id', ParseIntPipe) providerId: number,
    @Param('categoryId', ParseIntPipe) categoryId: number,
  ) {
    return this.providersService.getCategoryServicesByProviderId(
      providerId,
      categoryId,
    );
  }

  @Post(':id/services')
  @Roles('PROVIDER', 'ADMIN', 'USER')
  async addServices(
    @Param('id') id: string,
    @Body() body: { serviceIds: number[] },
    @Request() req,
  ) {
    // Providers can only modify their own services, admins can modify any
    if (req.user.role === 'PROVIDER' && req.user.userId !== Number(id)) {
      throw new BadRequestException('You can only modify your own services');
    }
    return this.providersService.addServices(Number(id), body.serviceIds);
  }

  @Delete(':id/services')
  @Roles('PROVIDER', 'ADMIN', 'USER')
  async removeServices(
    @Param('id') id: string,
    @Body() body: { serviceIds: number[] },
    @Request() req,
  ) {
    // Providers can only modify their own services, admins can modify any
    if (req.user.role === 'PROVIDER' && req.user.userId !== Number(id)) {
      throw new BadRequestException('You can only modify your own services');
    }
    return this.providersService.removeServices(Number(id), body.serviceIds);
  }

  @Get(':id/orders')
  @Roles('PROVIDER', 'ADMIN', 'USER')
  async getProviderOrders(@Param('id') id: string, @Request() req) {
    // Providers can only access their own orders, admins can access any
    if (req.user.role === 'PROVIDER' && req.user.userId !== Number(id)) {
      throw new BadRequestException('You can only access your own orders');
    }
    return this.providersService.getProviderOrders(Number(id));
  }

  @Get(':id/orders/pending')
  @Roles('PROVIDER', 'ADMIN', 'USER')
  async getProviderPendingOrders(@Param('id') id: string, @Request() req) {
    // Providers can only access their own orders, admins can access any
    if (req.user.role === 'PROVIDER' && req.user.userId !== Number(id)) {
      throw new BadRequestException('You can only access your own orders');
    }
    return this.providersService.getProviderPendingOrders(Number(id));
  }

  @Get(':id/orders/pending/count')
  @Roles('PROVIDER', 'ADMIN', 'USER')
  async getProviderStats(@Param('id') id: string, @Request() req) {
    // Providers can only access their own stats, admins can access any
    if (req.user.role === 'PROVIDER' && req.user.userId !== Number(id)) {
      throw new BadRequestException('You can only access your own stats');
    }
    return this.providersService.getProviderStats(Number(id));
  }

  @Get(':id/orders/:status')
  @Roles('PROVIDER', 'ADMIN', 'USER')
  async getProviderOrdersByStatus(
    @Param('id') id: string,
    @Param('status') status: string,
    @Request() req,
  ) {
    // Providers can only access their own orders, admins can access any
    if (req.user.role === 'PROVIDER' && req.user.userId !== Number(id)) {
      throw new BadRequestException('You can only access your own orders');
    }
    return this.providersService.getProviderOrdersByStatus(Number(id), status);
  }

  @Get(':id/ratings')
  @Roles('PROVIDER', 'ADMIN', 'USER')
  async getProviderRatings(@Param('id') id: string, @Request() req) {
    // Providers can only access their own ratings, admins can access any
    if (req.user.role === 'PROVIDER' && req.user.userId !== Number(id)) {
      throw new BadRequestException('You can only access your own ratings');
    }
    return this.providersService.getProviderRatings(Number(id));
  }

  @Get(':id/documents')
  @Roles('PROVIDER', 'ADMIN', 'USER')
  async getProviderDocuments(@Param('id') id: string, @Request() req) {
    // Providers can only access their own documents, admins can access any
    if (req.user.role === 'PROVIDER' && req.user.userId !== Number(id)) {
      throw new BadRequestException('You can only access your own documents');
    }
    return this.providersService.getProviderDocuments(Number(id));
  }

  @Get('top/comprehensive')
  async getTopProviders(
    @Request() req,
    @Query('limit') limit?: string,
    @Query('minRating') minRating?: string,
    @Query('minOrders') minOrders?: string,
    @Query('includeUnrated') includeUnrated?: string,
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
      includeUnratedBool,
      req.user.userId,
    );
  }

  // Account Deletion Endpoint
  @Delete('delete-account')
  @Roles('PROVIDER')
  @ApiOperation({ summary: 'Delete provider account with password verification' })
  @ApiResponse({
    status: 200,
    description: 'Account deleted successfully',
    type: DeleteAccountResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid password',
    type: DeleteAccountErrorResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Provider not found' })
  async deleteAccount(
    @Body() deleteAccountDto: DeleteAccountDto,
    @Request() req,
  ) {
    const result = await this.providersService.deleteAccount(
      req.user.userId,
      deleteAccountDto.password,
    );

    // If password is invalid, return 401 status
    if (!result.success) {
      throw new UnauthorizedException(result);
    }

    return result;
  }

  // Phone Number Change Endpoints
  @Post('change-phone/request')
  @Roles('PROVIDER')
  @ApiOperation({ summary: 'Request phone number change' })
  @ApiResponse({ status: 200, description: 'OTP sent successfully' })
  @ApiResponse({
    status: 400,
    description: 'Invalid request or phone number already in use',
  })
  @ApiResponse({ status: 404, description: 'Provider not found' })
  async requestPhoneChange(
    @Body() changePhoneDto: ChangePhoneRequestDto,
    @Request() req,
  ) {
    return this.providersService.requestPhoneChange(
      req.user.userId,
      changePhoneDto,
    );
  }

  @Post('change-phone/verify')
  @Roles('PROVIDER')
  @ApiOperation({ summary: 'Verify phone number change with OTP' })
  @ApiResponse({
    status: 200,
    description: 'Phone number changed successfully',
    type: PhoneChangeResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid OTP or request' })
  @ApiResponse({ status: 404, description: 'Provider not found' })
  async verifyPhoneChange(
    @Body() verifyPhoneDto: VerifyPhoneChangeDto,
    @Request() req,
  ) {
    return this.providersService.verifyPhoneChange(
      req.user.userId,
      verifyPhoneDto,
    );
  }
}

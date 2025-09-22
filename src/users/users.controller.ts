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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { FilesService } from '../files/files.service';
import { UsersService } from './users.service';
import { ComprehensiveAuthGuard } from '../auth/comprehensive-auth.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserLocationDto } from './dto/create-user-location.dto';
import {
  ChangePhoneRequestDto,
  VerifyPhoneChangeDto,
  PhoneChangeResponseDto,
} from './dto/change-phone.dto';
import { UpdateUserLocationDto } from './dto/update-user-location.dto';
import { diskStorage } from 'multer';
import { extname } from 'path';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, ComprehensiveAuthGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly filesService: FilesService,
  ) {}

  @Get()
  @Roles('ADMIN')
  async findAll() {
    return this.usersService.findAll();
  }

  @Get('profile')
  @Roles('USER', 'PROVIDER', 'ADMIN')
  async getProfile(@Request() req) {
    return this.usersService.getProfile(req.user.userId);
  }

  @Post()
  @Roles('ADMIN')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/images/users',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `user-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  async create(
    @Body() createUserDto: CreateUserDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const data = { ...createUserDto };
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
    return this.usersService.create(data);
  }

  @Put(':id')
  @Roles('USER', 'ADMIN')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/images/users',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `user-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  async update(
    @Param('id') id: string,
    @Body() data: UpdateUserDto,
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (req.user.userId !== Number(id) && req.user.role !== 'ADMIN') {
      return { error: 'Unauthorized' };
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
    return this.usersService.update(Number(id), updateData);
  }

  @Delete(':id')
  @Roles('USER', 'ADMIN')
  async remove(@Param('id') id: string, @Request() req) {
    if (req.user.userId !== Number(id) && req.user.role !== 'ADMIN') {
      return { error: 'Unauthorized' };
    }
    return this.usersService.remove(Number(id));
  }

  // User Location Management Endpoints
  @Get('locations')
  @Roles('USER', 'PROVIDER', 'ADMIN')
  async getUserLocations(@Request() req) {
    return this.usersService.getUserLocations(req.user.userId);
  }

  @Post('locations')
  @Roles('USER', 'PROVIDER', 'ADMIN')
  async createUserLocation(
    @Body() createLocationDto: CreateUserLocationDto,
    @Request() req,
  ) {
    return this.usersService.createUserLocation(
      req.user.userId,
      createLocationDto,
    );
  }

  @Put('locations/:id')
  @Roles('USER', 'PROVIDER', 'ADMIN')
  async updateUserLocation(
    @Param('id') id: string,
    @Body() updateLocationDto: UpdateUserLocationDto,
    @Request() req,
  ) {
    return this.usersService.updateUserLocation(
      req.user.userId,
      Number(id),
      updateLocationDto,
    );
  }

  @Delete('locations/:id')
  @Roles('USER', 'PROVIDER', 'ADMIN')
  async deleteUserLocation(@Param('id') id: string, @Request() req) {
    return this.usersService.deleteUserLocation(req.user.userId, Number(id));
  }

  @Put('locations/:id/set-default')
  @Roles('USER', 'PROVIDER', 'ADMIN')
  async setDefaultLocation(@Param('id') id: string, @Request() req) {
    return this.usersService.setDefaultLocation(req.user.userId, Number(id));
  }

  // Phone Number Change Endpoints
  @Post('change-phone/request')
  @Roles('USER')
  @ApiOperation({ summary: 'Request phone number change' })
  @ApiResponse({ status: 200, description: 'OTP sent successfully' })
  @ApiResponse({
    status: 400,
    description: 'Invalid request or phone number already in use',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async requestPhoneChange(
    @Body() changePhoneDto: ChangePhoneRequestDto,
    @Request() req,
  ) {
    return this.usersService.requestPhoneChange(
      req.user.userId,
      changePhoneDto,
    );
  }

  @Post('change-phone/verify')
  @Roles('USER')
  @ApiOperation({ summary: 'Verify phone number change with OTP' })
  @ApiResponse({
    status: 200,
    description: 'Phone number changed successfully',
    type: PhoneChangeResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid OTP or request' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async verifyPhoneChange(
    @Body() verifyPhoneDto: VerifyPhoneChangeDto,
    @Request() req,
  ) {
    return this.usersService.verifyPhoneChange(req.user.userId, verifyPhoneDto);
  }

  // Parameterized route - must come after all specific routes
  @Get(':id')
  @Roles('USER', 'PROVIDER', 'ADMIN')
  async findOne(@Param('id') id: string) {
    return this.usersService.findById(Number(id));
  }
}

import { Controller, Get, Param, Body, Post, Put, Delete, UseGuards, Request, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from '../files/files.service';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly filesService: FilesService
  ) { }

  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findById(Number(id));
  }

  @Post()
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
    @Body() createUserDto: CreateUserDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    const data = { ...createUserDto };
    if (file) {
      const fileResult = await this.filesService.handleUploadedFile(file);
      data.image = fileResult.url;
    } else {
      data.image = '';
    }
    return this.usersService.create(data);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() data: UpdateUserDto, @Request() req) {
    if (req.user.userId !== Number(id) && req.user.role !== 'ADMIN') {
      return { error: 'Unauthorized' };
    }
    return this.usersService.update(Number(id), data);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string, @Request() req) {
    if (req.user.userId !== Number(id) && req.user.role !== 'ADMIN') {
      return { error: 'Unauthorized' };
    }
    return this.usersService.remove(Number(id));
  }
}

import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  UseGuards,
  Query,
  Body
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { FilesService, FileUploadResult, FileValidationOptions } from './files.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

@Controller('files')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) { }

  private static ensureDirectory(dirPath: string): void {
    if (!existsSync(dirPath)) {
      mkdirSync(dirPath, { recursive: true });
    }
  }

  private static getStorageConfig(destination: string) {
    return diskStorage({
      destination: (req, file, cb) => {
        FilesController.ensureDirectory(destination);
        cb(null, destination);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        const prefix = destination.includes('documents') ? 'doc-' :
          destination.includes('images') ? 'img-' : '';
        cb(null, `${prefix}${uniqueSuffix}${ext}`);
      },
    });
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: FilesController.getStorageConfig('./uploads'),
  }))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { category?: string; maxSize?: number; allowedTypes?: string }
  ) {
    const options: FileValidationOptions = {};

    if (body.maxSize) {
      options.maxSize = parseInt(body.maxSize.toString());
    }

    if (body.allowedTypes) {
      options.allowedMimeTypes = body.allowedTypes.split(',');
    }

    const result = await this.filesService.handleUploadedFile(file, options);
    return result;
  }

  @Post('upload-multiple')
  @UseInterceptors(FilesInterceptor('files', 10, {
    storage: FilesController.getStorageConfig('./uploads'),
  }))
  async uploadMultipleFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: { category?: string; maxSize?: number; allowedTypes?: string }
  ) {
    const options: FileValidationOptions = {};

    if (body.maxSize) {
      options.maxSize = parseInt(body.maxSize.toString());
    }

    if (body.allowedTypes) {
      options.allowedMimeTypes = body.allowedTypes.split(',');
    }

    const results = await this.filesService.handleMultipleFiles(files, options);
    return {
      message: `Successfully uploaded ${results.length} files`,
      files: results
    };
  }

  @Post('upload-documents')
  @Roles('PROVIDER')
  @UseInterceptors(FilesInterceptor('documents', 5, {
    storage: FilesController.getStorageConfig('./uploads/documents'),
  }))
  async uploadDocuments(
    @UploadedFiles() files: Express.Multer.File[]
  ) {
    const options: FileValidationOptions = {
      maxSize: 10 * 1024 * 1024, // 10MB for documents
      allowedMimeTypes: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png'
      ],
      allowedExtensions: ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png']
    };

    const results = await this.filesService.handleMultipleFiles(files, options);
    return {
      message: `Successfully uploaded ${results.length} documents`,
      documents: results
    };
  }

  @Post('upload-documents-admin')
  @Roles('ADMIN')
  @UseInterceptors(FilesInterceptor('documents', 5, {
    storage: FilesController.getStorageConfig('./uploads/documents'),
  }))
  async uploadDocumentsAdmin(
    @UploadedFiles() files: Express.Multer.File[]
  ) {
    const options: FileValidationOptions = {
      maxSize: 10 * 1024 * 1024, // 10MB for documents
      allowedMimeTypes: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png'
      ],
      allowedExtensions: ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png']
    };

    const results = await this.filesService.handleMultipleFiles(files, options);
    return {
      message: `Successfully uploaded ${results.length} documents`,
      documents: results
    };
  }

  @Post('upload-images')
  @UseInterceptors(FilesInterceptor('images', 10, {
    storage: FilesController.getStorageConfig('./uploads/images'),
  }))
  async uploadImages(
    @UploadedFiles() files: Express.Multer.File[]
  ) {
    const options: FileValidationOptions = {
      maxSize: 5 * 1024 * 1024, // 5MB for images
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif'],
      allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif']
    };

    const results = await this.filesService.handleMultipleFiles(files, options);
    return {
      message: `Successfully uploaded ${results.length} images`,
      images: results
    };
  }

  @Delete(':filename')
  @Roles('ADMIN')
  async deleteFile(@Param('filename') filename: string) {
    await this.filesService.deleteFile(filename);
    return { message: 'File deleted successfully' };
  }

  @Delete('delete-multiple')
  @Roles('ADMIN')
  async deleteMultipleFiles(@Body() body: { filenames: string[] }) {
    await this.filesService.deleteMultipleFiles(body.filenames);
    return { message: `${body.filenames.length} files deleted successfully` };
  }

  @Get('info/:filename')
  async getFileInfo(@Param('filename') filename: string) {
    const fileInfo = await this.filesService.getFileInfo(filename);
    if (!fileInfo) {
      return { message: 'File not found' };
    }
    return fileInfo;
  }

  @Get('stats')
  @Roles('ADMIN')
  async getUploadStats() {
    return this.filesService.getUploadStats();
  }
}

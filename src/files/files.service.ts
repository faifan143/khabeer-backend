import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Express } from 'express';
import { join } from 'path';
import { existsSync, mkdirSync, unlinkSync } from 'fs';

export interface FileUploadResult {
  filename: string;
  originalName: string;
  url: string;
  size: number;
  mimetype: string;
}

export interface FileValidationOptions {
  maxSize?: number; // in bytes
  allowedMimeTypes?: string[];
  allowedExtensions?: string[];
}

@Injectable()
export class FilesService {
  private readonly uploadBaseUrl: string;
  private readonly uploadDir: string;
  private readonly maxFileSize: number;
  private readonly allowedMimeTypes: string[];
  private readonly allowedExtensions: string[];

  constructor(private readonly configService: ConfigService) {
    this.uploadBaseUrl = this.configService.get('UPLOAD_BASE_URL', 'http://localhost:3000/uploads/');
    this.uploadDir = join(process.cwd(), 'uploads');
    this.maxFileSize = this.configService.get('MAX_FILE_SIZE', 5 * 1024 * 1024); // 5MB default
    this.allowedMimeTypes = this.configService.get('ALLOWED_MIME_TYPES', 'image/jpeg,image/png,image/gif,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document').split(',');
    this.allowedExtensions = this.configService.get('ALLOWED_EXTENSIONS', '.jpg,.jpeg,.png,.gif,.pdf,.doc,.docx').split(',');

    // Ensure upload directory exists
    this.ensureUploadDirectory();
  }

  private ensureUploadDirectory(): void {
    if (!existsSync(this.uploadDir)) {
      mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  getPublicUrl(filename: string): string {
    return this.uploadBaseUrl + filename;
  }

  // Enhanced single file upload with validation
  async handleUploadedFile(file: Express.Multer.File, options?: FileValidationOptions): Promise<FileUploadResult> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Validate file
    this.validateFile(file, options);

    const result: FileUploadResult = {
      filename: file.filename,
      originalName: file.originalname,
      url: this.getPublicUrl(file.filename),
      size: file.size,
      mimetype: file.mimetype
    };

    return result;
  }

  // Multiple file upload
  async handleMultipleFiles(files: Express.Multer.File[], options?: FileValidationOptions): Promise<FileUploadResult[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    const results: FileUploadResult[] = [];

    for (const file of files) {
      try {
        const result = await this.handleUploadedFile(file, options);
        results.push(result);
      } catch (error) {
        // If one file fails, delete all uploaded files and throw error
        for (const uploadedFile of results) {
          this.deleteFile(uploadedFile.filename);
        }
        throw error;
      }
    }

    return results;
  }

  // File validation
  private validateFile(file: Express.Multer.File, options?: FileValidationOptions): void {
    const maxSize = options?.maxSize || this.maxFileSize;
    const allowedMimeTypes = options?.allowedMimeTypes || this.allowedMimeTypes;
    const allowedExtensions = options?.allowedExtensions || this.allowedExtensions;

    // Check file size
    if (file.size > maxSize) {
      this.deleteFile(file.filename);
      throw new BadRequestException(`File size exceeds maximum allowed size of ${this.formatBytes(maxSize)}`);
    }

    // Check MIME type
    if (!allowedMimeTypes.includes(file.mimetype)) {
      this.deleteFile(file.filename);
      throw new BadRequestException(`File type ${file.mimetype} is not allowed`);
    }

    // Check file extension
    const fileExtension = this.getFileExtension(file.originalname);
    if (!allowedExtensions.includes(fileExtension.toLowerCase())) {
      this.deleteFile(file.filename);
      throw new BadRequestException(`File extension ${fileExtension} is not allowed`);
    }
  }

  // Delete file
  async deleteFile(filename: string): Promise<void> {
    const filePath = join(this.uploadDir, filename);
    if (existsSync(filePath)) {
      try {
        unlinkSync(filePath);
      } catch (error) {
        console.error(`Error deleting file ${filename}:`, error);
      }
    }
  }

  // Delete multiple files
  async deleteMultipleFiles(filenames: string[]): Promise<void> {
    for (const filename of filenames) {
      await this.deleteFile(filename);
    }
  }

  // Get file extension
  private getFileExtension(filename: string): string {
    return filename.substring(filename.lastIndexOf('.'));
  }

  // Format bytes to human readable format
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Get file info
  async getFileInfo(filename: string): Promise<FileUploadResult | null> {
    const filePath = join(this.uploadDir, filename);
    if (!existsSync(filePath)) {
      return null;
    }

    // This is a simplified version - in a real app you might want to store file metadata in database
    return {
      filename,
      originalName: filename, // We don't have original name stored
      url: this.getPublicUrl(filename),
      size: 0, // We don't have size stored
      mimetype: this.getMimeTypeFromExtension(this.getFileExtension(filename))
    };
  }

  // Get MIME type from extension
  private getMimeTypeFromExtension(extension: string): string {
    const mimeTypes: { [key: string]: string } = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    };

    return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
  }

  // Create organized upload directories
  async createUploadDirectory(category: string): Promise<string> {
    const categoryDir = join(this.uploadDir, category);
    if (!existsSync(categoryDir)) {
      mkdirSync(categoryDir, { recursive: true });
    }
    return categoryDir;
  }

  // Upload to specific category
  async uploadToCategory(file: Express.Multer.File, category: string, options?: FileValidationOptions): Promise<FileUploadResult> {
    await this.createUploadDirectory(category);
    return this.handleUploadedFile(file, options);
  }

  // Get upload statistics
  async getUploadStats(): Promise<{
    totalFiles: number;
    totalSize: number;
    categories: { [key: string]: number };
  }> {
    // This would require database storage for accurate stats
    // For now, return basic info
    return {
      totalFiles: 0,
      totalSize: 0,
      categories: {}
    };
  }
}

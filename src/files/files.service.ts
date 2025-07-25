import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Express } from 'express';
import { join } from 'path';

@Injectable()
export class FilesService {
  private readonly uploadBaseUrl: string;
  private readonly uploadDir: string;

  constructor(private readonly configService: ConfigService) {
    this.uploadBaseUrl = this.configService.get('UPLOAD_BASE_URL', 'http://localhost:3000/uploads/');
    this.uploadDir = join(process.cwd(), 'uploads');
  }

  getPublicUrl(filename: string): string {
    return this.uploadBaseUrl + filename;
  }

  // This can be used by other services to get the public URL after upload
  async handleUploadedFile(file: Express.Multer.File): Promise<string> {
    return this.getPublicUrl(file.filename);
  }
}

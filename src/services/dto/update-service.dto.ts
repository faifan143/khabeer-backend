import { IsString, IsNumber, IsOptional, IsIn } from 'class-validator';

export class UpdateServiceDto {
  @IsOptional()
  @IsString()
  titleAr?: string;

  @IsOptional()
  @IsString()
  titleEn?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  commission?: number;

  @IsOptional()
  @IsString()
  whatsapp?: string;

  @IsOptional()
  @IsString()
  @IsIn(['NORMAL', 'KHABEER'])
  serviceType?: string;

  @IsOptional()
  @IsNumber()
  categoryId?: number;
}

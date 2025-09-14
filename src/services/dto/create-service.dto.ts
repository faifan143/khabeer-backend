import { IsString, IsNumber, IsOptional, IsNotEmpty, IsIn } from 'class-validator';

export class CreateServiceDto {
  @IsString()
  @IsNotEmpty()
  titleAr: string;

  @IsString()
  @IsNotEmpty()
  titleEn: string;

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

  @IsNumber()
  @IsNotEmpty()
  categoryId: number;
}

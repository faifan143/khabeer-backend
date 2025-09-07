import { IsString, IsNumber, IsOptional, IsNotEmpty, IsIn } from 'class-validator';

export class CreateServiceDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsNumber()
  commission?: number;

  @IsString()
  @IsNotEmpty()
  whatsapp: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  @IsIn(['NORMAL', 'KHABEER'])
  serviceType?: string;

  @IsOptional()
  @IsNumber()
  categoryId?: number;
}

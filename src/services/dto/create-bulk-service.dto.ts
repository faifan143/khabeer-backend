import {
  IsString,
  IsNumber,
  IsOptional,
  IsNotEmpty,
  IsIn,
  IsArray,
  ArrayMinSize,
  IsInt,
} from 'class-validator';

export class CreateBulkServiceDto {
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

  @IsArray()
  @ArrayMinSize(1, { message: 'At least one category ID must be provided' })
  @IsInt({ each: true })
  @IsNotEmpty({ each: true })
  categoryIds: number[];
}

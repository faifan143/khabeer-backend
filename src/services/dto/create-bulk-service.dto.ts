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
import { Transform } from 'class-transformer';

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
  @Transform(({ value }) => {
    if (Array.isArray(value)) {
      return value.map((id) => parseInt(id, 10));
    }
    return value;
  })
  @IsInt({ each: true })
  @IsNotEmpty({ each: true })
  categoryIds: number[];
}

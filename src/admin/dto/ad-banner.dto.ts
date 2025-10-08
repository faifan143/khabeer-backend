import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsEnum,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateAdBannerDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsEnum(['external', 'provider', 'internal'])
  linkType: string;

  @IsOptional()
  @IsString()
  externalLink?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  providerId?: number;

  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value === 'true';
    }
    return Boolean(value);
  })
  @IsBoolean()
  isActive: boolean;
}

export class UpdateAdBannerDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsEnum(['external', 'provider', 'internal'])
  linkType?: string;

  @IsOptional()
  @IsString()
  externalLink?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  providerId?: number;

  @IsOptional()
  @IsString()
  isActive?: string;
}

export class AdBannerResponseDto {
  id: number;
  title: string;
  description: string;
  imageUrl: string | null;
  linkType: string;
  externalLink: string | null;
  providerId: number | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

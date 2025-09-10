import { IsEmail, IsString, IsOptional, MinLength, IsArray, IsBoolean, IsNumber, IsEnum, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ServiceWithPriceDto } from '../../providers/dto/service-with-price.dto';

export enum RegisterType {
  USER = 'user',
  PROVIDER = 'provider'
}

export class RegisterDto {
  @ApiProperty({ description: 'Registration type - user (phone) or provider (email)', enum: RegisterType })
  @IsEnum(RegisterType)
  registerType: RegisterType;

  @IsString()
  name: string;

  @IsOptional()
  @IsEmail()
  email?: string; // Optional for users, required for providers

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  fcm?: string; // Optional FCM token

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  officialDocuments?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServiceWithPriceDto)
  services?: ServiceWithPriceDto[]; // Services with prices for provider registration

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  serviceIds?: number[]; // For backward compatibility - deprecated, use services instead
}

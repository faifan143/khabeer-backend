import { IsString, IsBoolean, IsOptional, IsNotEmpty, IsArray, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ServiceWithPriceDto } from './service-with-price.dto';

export class CreateProviderDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsString()
  @IsNotEmpty()
  image: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  state: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  onlineStatus?: boolean;

  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @IsOptional()
  location?: any;

  @IsOptional()
  @IsString()
  officialDocuments?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServiceWithPriceDto)
  services?: ServiceWithPriceDto[]; // Services with prices the provider offers (optional for registration)

  // Keep serviceIds for backward compatibility
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  serviceIds?: number[]; // IDs of services the provider offers (deprecated - use services instead)

  @IsOptional()
  @IsString()
  fcm?: string; // Optional FCM token
}

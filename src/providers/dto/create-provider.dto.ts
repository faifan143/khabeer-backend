import { IsString, IsBoolean, IsOptional, IsNotEmpty, IsArray, IsNumber } from 'class-validator';
import { IsValidOmanState } from '../../utils/validators';

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
  @IsValidOmanState({
    message: 'Please select a valid Omani state for the provider'
  })
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
  @IsNumber({}, { each: true })
  categoryIds?: number[]; // IDs of categories the provider wants to offer services in

  @IsOptional()
  @IsString()
  fcm?: string; // Optional FCM token
}

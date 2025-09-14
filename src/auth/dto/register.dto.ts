import { IsEmail, IsString, IsOptional, MinLength, IsArray, IsBoolean, IsNumber, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsValidOmanState } from '../../utils/validators';

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
  email?: string; // Optional for both users and providers

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
  @IsValidOmanState({
    message: 'Please select a valid Omani state'
  })
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
  @IsNumber({}, { each: true })
  categoryIds?: number[]; // IDs of categories the provider wants to offer services in
}

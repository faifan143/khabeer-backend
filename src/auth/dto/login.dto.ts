import { IsString, IsOptional, ValidateIf, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum LoginType {
  USER = 'USER',
  PROVIDER = 'PROVIDER',
}

export class LoginDto {
  @ApiProperty({
    description: 'Email address (required for admin login, optional for regular users)',
    required: false,
  })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({
    description:
      'Phone number for login (required for users and providers, optional for admin). Can be sent with or without + prefix (e.g., "+96812345678" or "96812345678")',
    required: false,
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: 'User password' })
  @IsString()
  password: string;

  @ApiProperty({
    description:
      'Account type - USER or PROVIDER (required for regular users, optional for admin)',
    enum: LoginType,
    required: false,
  })
  @IsOptional()
  @IsEnum(LoginType)
  type?: LoginType;

  @ApiProperty({
    description: 'FCM token for push notifications',
    required: false,
  })
  @IsOptional()
  @IsString()
  fcm?: string; // Optional FCM token
}

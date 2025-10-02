import { IsString, IsOptional, ValidateIf, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum LoginType {
  USER = 'USER',
  PROVIDER = 'PROVIDER',
}

export class LoginDto {
  @ApiProperty({
    description: 'Email address (optional)',
    required: false,
  })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({
    description:
      'Phone number for login (required for both users and providers)',
    required: true,
  })
  @IsString()
  phone: string;

  @ApiProperty({ description: 'User password' })
  @IsString()
  password: string;

  @ApiProperty({
    description:
      'Account type - USER or PROVIDER (required to distinguish between user and provider accounts with same phone number)',
    enum: LoginType,
    required: true,
  })
  @IsEnum(LoginType)
  type: LoginType;

  @ApiProperty({
    description: 'FCM token for push notifications',
    required: false,
  })
  @IsOptional()
  @IsString()
  fcm?: string; // Optional FCM token
}

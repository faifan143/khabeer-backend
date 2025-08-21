import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum LoginType {
  USER = 'user',
  PROVIDER = 'provider'
}

export class LoginDto {
  @ApiProperty({ description: 'Login type - user (phone) or provider (email)', enum: LoginType })
  @IsEnum(LoginType)
  loginType: LoginType;

  @ApiProperty({ description: 'Phone number (for users) or email (for providers)' })
  @IsString()
  identifier: string;

  @ApiProperty({ description: 'User password' })
  @IsString()
  password: string;

  @ApiProperty({ description: 'FCM token for push notifications', required: false })
  @IsOptional()
  @IsString()
  fcm?: string; // Optional FCM token
}

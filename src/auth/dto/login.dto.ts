import { IsString, IsOptional, ValidateIf } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'Email for provider login (required if phone not provided)',
    required: false
  })
  @ValidateIf(o => !o.phone)
  @IsString()
  email?: string;

  @ApiProperty({
    description: 'Phone number for user login (required if email not provided)',
    required: false
  })
  @ValidateIf(o => !o.email)
  @IsString()
  phone?: string;

  @ApiProperty({ description: 'User password' })
  @IsString()
  password: string;

  @ApiProperty({ description: 'FCM token for push notifications', required: false })
  @IsOptional()
  @IsString()
  fcm?: string; // Optional FCM token
}

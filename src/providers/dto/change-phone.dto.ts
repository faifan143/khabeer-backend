import { IsString, IsPhoneNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePhoneRequestDto {
  @ApiProperty({
    description: 'New phone number to change to',
    example: '+96812345678',
  })
  @IsPhoneNumber()
  newPhoneNumber: string;
}

export class VerifyPhoneChangeDto {
  @ApiProperty({
    description: 'New phone number',
    example: '+96812345678',
  })
  @IsPhoneNumber()
  newPhoneNumber: string;

  @ApiProperty({
    description: 'OTP code received via SMS',
    example: '123456',
  })
  @IsString()
  otp: string;
}

export class PhoneChangeResponseDto {
  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'Phone number changed successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Updated phone number',
    example: '+96812345678',
  })
  newPhoneNumber?: string;
}

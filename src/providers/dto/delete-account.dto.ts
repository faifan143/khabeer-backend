import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeleteAccountDto {
  @ApiProperty({
    description: 'Current password for account verification',
    example: 'user_password123',
    minLength: 6
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6, {
    message: 'Password must be at least 6 characters long'
  })
  password: string;
}

export class DeleteAccountResponseDto {
  @ApiProperty({
    description: 'Success status',
    example: true
  })
  success: boolean;

  @ApiProperty({
    description: 'Success message in English',
    example: 'Account deleted successfully'
  })
  message: string;

  @ApiProperty({
    description: 'Success message in Arabic',
    example: 'تم حذف الحساب بنجاح'
  })
  message_ar: string;
}

export class DeleteAccountErrorResponseDto {
  @ApiProperty({
    description: 'Success status',
    example: false
  })
  success: boolean;

  @ApiProperty({
    description: 'Error message in English',
    example: 'Invalid password'
  })
  message: string;

  @ApiProperty({
    description: 'Error message in Arabic',
    example: 'كلمة المرور غير صحيحة'
  })
  message_ar: string;

  @ApiProperty({
    description: 'Error code',
    example: 'INVALID_PASSWORD'
  })
  error: string;
}

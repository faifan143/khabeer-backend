import { IsString, IsPhoneNumber, IsOptional } from 'class-validator';

export class SendOtpDto {
  @IsPhoneNumber()
  phoneNumber: string;

  @IsOptional()
  @IsString()
  purpose?: string; // 'login', 'registration', 'password_reset', etc.
}

export class VerifyOtpDto {
  @IsPhoneNumber()
  phoneNumber: string;

  @IsString()
  otp: string;

  @IsOptional()
  @IsString()
  purpose?: string;
}

export class OtpResponseDto {
  success: boolean;
  message: string;
  expiresIn?: number; // seconds
  retryAfter?: number; // seconds
} 
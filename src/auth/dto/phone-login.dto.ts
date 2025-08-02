import { IsPhoneNumber, IsString, IsOptional } from 'class-validator';

export class PhoneLoginDto {
  @IsPhoneNumber()
  phoneNumber: string;

  @IsOptional()
  @IsString()
  purpose?: string; // login, registration, password_reset
}

export class PhoneLoginVerifyDto {
  @IsPhoneNumber()
  phoneNumber: string;

  @IsString()
  otp: string;

  @IsOptional()
  @IsString()
  purpose?: string;
}

export class PhoneLoginResponseDto {
  success: boolean;
  message: string;
  access_token?: string;
  user?: {
    id: number;
    phone: string;
    role: string;
  };
} 
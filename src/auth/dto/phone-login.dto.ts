import { IsPhoneNumber, IsString, IsOptional } from 'class-validator';

export class PhoneLoginDto {
  @IsPhoneNumber()
  phoneNumber: string;

  @IsOptional()
  @IsString()
  purpose?: string; // registration, password_reset (removed login)
}

export class PhoneRegistrationDto {
  @IsPhoneNumber()
  phoneNumber: string;

  @IsOptional()
  @IsString()
  otp?: string;

  @IsOptional()
  @IsString()
  purpose?: string;
}

export class DirectPhoneLoginDto {
  @IsPhoneNumber()
  phoneNumber: string;

  @IsOptional()
  @IsString()
  password?: string;
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
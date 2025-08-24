import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, Matches } from 'class-validator';

export class SendPasswordResetOtpDto {
    @ApiProperty({
        description: 'Phone number to send password reset OTP',
        example: '+963998419872',
        pattern: '^\\+[1-9]\\d{1,14}$'
    })
    @IsString()
    @IsNotEmpty()
    @Matches(/^\+[1-9]\d{1,14}$/, {
        message: 'Phone number must be in international format (e.g., +963998419872)'
    })
    phoneNumber: string;
}

export class ResetPasswordDto {
    @ApiProperty({
        description: 'Phone number associated with the account',
        example: '+963998419872',
        pattern: '^\\+[1-9]\\d{1,14}$'
    })
    @IsString()
    @IsNotEmpty()
    @Matches(/^\+[1-9]\d{1,14}$/, {
        message: 'Phone number must be in international format (e.g., +963998419872)'
    })
    phoneNumber: string;

    @ApiProperty({
        description: 'OTP code received via SMS',
        example: '123456',
        minLength: 6,
        maxLength: 6
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    otp: string;

    @ApiProperty({
        description: 'New password for the account',
        example: 'newpassword123',
        minLength: 6
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(6, {
        message: 'Password must be at least 6 characters long'
    })
    newPassword: string;
}

export class PasswordResetResponseDto {
    @ApiProperty({
        description: 'Whether the operation was successful',
        example: true
    })
    success: boolean;

    @ApiProperty({
        description: 'Response message',
        example: 'OTP sent successfully'
    })
    message: string;

    @ApiProperty({
        description: 'OTP expiration time in seconds (only for send OTP)',
        example: 600,
        required: false
    })
    expiresIn?: number;
}

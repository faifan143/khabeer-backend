import { IsString, IsOptional, IsArray, IsEnum, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum NotificationType {
    GENERAL = 'general',
    ORDER = 'order',
    OFFER = 'offer',
    SYSTEM = 'system',
}

export enum TargetAudience {
    CUSTOMERS = 'customers',
    PROVIDERS = 'providers',
    ALL = 'all',
}

export class CreateNotificationDto {
    @ApiProperty({ description: 'Notification title' })
    @IsString()
    title: string;

    @ApiProperty({ description: 'Notification message' })
    @IsString()
    message: string;

    @ApiPropertyOptional({ description: 'Notification image URL' })
    @IsOptional()
    @IsString()
    imageUrl?: string;

    @ApiProperty({
        description: 'Target audience for the notification',
        enum: TargetAudience,
        isArray: true
    })
    @IsArray()
    targetAudience: TargetAudience[];

    @ApiPropertyOptional({
        description: 'Type of notification',
        enum: NotificationType,
        default: NotificationType.GENERAL
    })
    @IsOptional()
    @IsEnum(NotificationType)
    notificationType?: NotificationType = NotificationType.GENERAL;

    @ApiPropertyOptional({ description: 'Additional data for FCM payload' })
    @IsOptional()
    @IsObject()
    data?: Record<string, any>;
} 
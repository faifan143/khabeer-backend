import { IsString, IsOptional, IsArray, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ChannelType {
    PROVIDERS = 'providers',
    USERS = 'users',
}

export enum SubscriptionAction {
    SUBSCRIBE = 'subscribe',
    UNSUBSCRIBE = 'unsubscribe',
}

export class CreateChannelDto {
    @ApiProperty({ description: 'Channel name' })
    @IsString()
    name: string;

    @ApiProperty({ description: 'Channel type', enum: ChannelType })
    @IsEnum(ChannelType)
    type: ChannelType;

    @ApiPropertyOptional({ description: 'Channel description' })
    @IsOptional()
    @IsString()
    description?: string;
}

export class SubscribeToChannelDto {
    @ApiProperty({ description: 'FCM token to subscribe' })
    @IsString()
    fcmToken: string;

    @ApiProperty({ description: 'Channel to subscribe to', enum: ChannelType })
    @IsEnum(ChannelType)
    channel: ChannelType;
}

export class UnsubscribeFromChannelDto {
    @ApiProperty({ description: 'FCM token to unsubscribe' })
    @IsString()
    fcmToken: string;

    @ApiProperty({ description: 'Channel to unsubscribe from', enum: ChannelType })
    @IsEnum(ChannelType)
    channel: ChannelType;
}

export class BulkSubscriptionDto {
    @ApiProperty({ description: 'FCM tokens to subscribe/unsubscribe', type: [String] })
    @IsArray()
    @IsString({ each: true })
    fcmTokens: string[];

    @ApiProperty({ description: 'Channel to subscribe/unsubscribe to', enum: ChannelType })
    @IsEnum(ChannelType)
    channel: ChannelType;

    @ApiProperty({ description: 'Action to perform', enum: SubscriptionAction })
    @IsEnum(SubscriptionAction)
    action: SubscriptionAction;
} 
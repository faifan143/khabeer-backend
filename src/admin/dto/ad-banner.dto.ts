import { IsString, IsOptional, IsBoolean, IsNumber, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateAdBannerDto {
    @IsString()
    title: string;

    @IsString()
    description: string;

    @IsOptional()
    @IsString()
    imageUrl?: string;

    @IsEnum(['external', 'provider', 'internal'])
    linkType: string;

    @IsOptional()
    @IsString()
    externalLink?: string;

    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    providerId?: number;

    @Transform(({ value }) => value === 'true' || value === true)
    @IsBoolean()
    isActive: boolean;
}

export class UpdateAdBannerDto {
    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    imageUrl?: string;

    @IsOptional()
    @IsEnum(['external', 'provider', 'internal'])
    linkType?: string;

    @IsOptional()
    @IsString()
    externalLink?: string;

    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    providerId?: number;

    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    @IsBoolean()
    isActive?: boolean;
}

export class AdBannerResponseDto {
    id: number;
    title: string;
    description: string;
    imageUrl: string | null;
    linkType: string;
    externalLink: string | null;
    providerId: number | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

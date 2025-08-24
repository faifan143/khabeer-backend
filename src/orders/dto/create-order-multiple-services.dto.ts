import { IsInt, IsString, IsOptional, IsNumber, IsDateString, IsEnum, Min, IsObject, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export enum OrderLocation {
    HOME = 'Home',
    WORK = 'Work',
    OTHER = 'Other'
}

export class OrderServiceItemDto {
    @IsInt()
    serviceId: number;

    @IsInt()
    @Min(1)
    quantity: number = 1;
}

export class CreateOrderMultipleServicesDto {
    @IsInt()
    providerId: number;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderServiceItemDto)
    services: OrderServiceItemDto[];

    @IsOptional()
    @IsDateString()
    scheduledDate?: string;

    // Location can be either a saved location ID or current coordinates
    @IsOptional()
    @IsInt()
    savedLocationId?: number;

    @IsOptional()
    @IsObject()
    currentLocation?: {
        latitude: number;
        longitude: number;
        address?: string;
    };

    @IsOptional()
    @IsString()
    notes?: string;
}

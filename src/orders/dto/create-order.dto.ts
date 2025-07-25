import { IsInt, IsString, IsOptional, IsNumber, IsDateString, IsEnum, Min, IsObject } from 'class-validator';

export enum OrderLocation {
    HOME = 'Home',
    WORK = 'Work',
    OTHER = 'Other'
}

export class CreateOrderDto {
    @IsInt()
    providerId: number;

    @IsInt()
    serviceId: number;

    @IsOptional()
    @IsDateString()
    scheduledDate?: string;

    @IsOptional()
    @IsEnum(OrderLocation)
    location?: OrderLocation;

    @IsOptional()
    @IsString()
    locationDetails?: string;

    @IsOptional()
    @IsInt()
    @Min(1)
    quantity?: number = 1;

    @IsOptional()
    @IsObject()
    providerLocation?: { lat: number; lng: number };
} 
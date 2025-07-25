import { IsEnum, IsOptional, IsString, IsObject } from 'class-validator';

export enum OrderStatus {
    PENDING = 'pending',
    ACCEPTED = 'accepted',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled'
}

export class UpdateOrderStatusDto {
    @IsEnum(OrderStatus)
    status: OrderStatus;

    @IsOptional()
    @IsString()
    notes?: string;

    @IsOptional()
    @IsObject()
    providerLocation?: { lat: number; lng: number };
} 
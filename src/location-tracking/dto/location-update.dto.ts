import { IsNumber, IsOptional, IsString } from 'class-validator';

export class LocationUpdateDto {
  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsOptional()
  @IsNumber()
  accuracy?: number;

  @IsString()
  orderId: string; // Numeric order ID as string
}

export class StartTrackingDto {
  @IsString()
  orderId: string; // Numeric order ID as string
}

export class StopTrackingDto {
  @IsString()
  orderId: string; // Numeric order ID as string
} 
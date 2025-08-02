import { IsNumber, IsOptional, IsString, IsBoolean, IsInt } from 'class-validator';

export class LocationUpdateDto {
  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsOptional()
  @IsNumber()
  accuracy?: number;

  @IsOptional()
  @IsString()
  orderId?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class StartTrackingDto {
  @IsString()
  orderId: string;

  @IsOptional()
  @IsNumber()
  updateInterval?: number; // in seconds, default 30
}

export class StopTrackingDto {
  @IsString()
  orderId: string;
}

export class TrackOrderDto {
  @IsString()
  orderId: string;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: Date;
  providerId: number;
  orderId: string;
} 
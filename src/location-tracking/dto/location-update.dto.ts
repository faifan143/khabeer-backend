import { IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export class LocationUpdateDto {
  @IsNumber({ maxDecimalPlaces: 8 })
  @Min(-90)
  @Max(90)
  @Transform(({ value }) => parseFloat(value))
  latitude: number;

  @IsNumber({ maxDecimalPlaces: 8 })
  @Min(-180)
  @Max(180)
  @Transform(({ value }) => parseFloat(value))
  longitude: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(1000)
  @Transform(({ value }) => value ? parseFloat(value) : 0)
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
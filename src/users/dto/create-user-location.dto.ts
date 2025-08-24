import { IsString, IsOptional, IsNumber, IsBoolean, Min, Max } from 'class-validator';

export class CreateUserLocationDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

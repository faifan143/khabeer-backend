import { IsString, IsBoolean, IsOptional, IsArray, IsNumber } from 'class-validator';
import { IsValidOmanState } from '../../utils/validators';

export class UpdateProviderDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @IsValidOmanState({
    message: 'Please select a valid Omani state for the provider'
  })
  state?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  onlineStatus?: boolean;

  @IsOptional()
  @IsString()
  officialDocuments?: string;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  serviceIds?: number[];

  @IsOptional()
  @IsString()
  password?: string;
}

import { IsString, IsOptional } from 'class-validator';
import { IsValidOmanState } from '../../utils/validators';

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  titleAr?: string;

  @IsOptional()
  @IsString()
  titleEn?: string;

  @IsOptional()
  @IsString()
  @IsValidOmanState({
    message: 'Please select a valid Omani state for the category'
  })
  state?: string;
}

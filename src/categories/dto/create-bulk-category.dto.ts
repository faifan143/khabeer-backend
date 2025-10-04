import { ArrayMinSize, IsArray, IsNotEmpty, IsString } from 'class-validator';
import { IsValidOmanState } from '../../utils/validators';

export class CreateBulkCategoryDto {
  @IsString()
  @IsNotEmpty()
  titleAr: string;

  @IsString()
  @IsNotEmpty()
  titleEn: string;

  @IsArray()
  @ArrayMinSize(1, { message: 'At least one state must be provided' })
  @IsString({ each: true })
  @IsValidOmanState({
    message: 'Please select valid Omani states for the category',
    each: true,
  })
  states: string[];
}

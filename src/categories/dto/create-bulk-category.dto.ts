import {
  IsString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
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

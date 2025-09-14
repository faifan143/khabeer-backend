import { IsString, IsNotEmpty } from 'class-validator';
import { IsValidOmanState } from '../../utils/validators';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  titleAr: string;

  @IsString()
  @IsNotEmpty()
  titleEn: string;

  @IsString()
  @IsNotEmpty()
  @IsValidOmanState({
    message: 'Please select a valid Omani state for the category'
  })
  state: string;
}

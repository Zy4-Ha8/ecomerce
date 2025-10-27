import {
  IsOptional,
  IsString,
  IsEnum,
  IsBooleanString,
  IsNumberString,
} from 'class-validator';
import { Gender } from 'src/enum/gender.enum';

export class FilterProductDto {
  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsString()
  season?: string;

  @IsOptional()
  @IsString()
  styleTags?: string;

  @IsOptional()
  @IsString()
  sizes?: string;

  @IsOptional()
  @IsString()
  colors?: string;

  @IsOptional()
  @IsNumberString()
  minPrice?: string;

  @IsOptional()
  @IsNumberString()
  maxPrice?: string;

  @IsOptional()
  @IsBooleanString()
  hasDiscount?: string; 

  @IsOptional()
  @IsNumberString()
  minDiscountPrice?: string;


  @IsOptional()
  @IsBooleanString()
  isBestSeller?: string;

  @IsOptional()
  @IsBooleanString()
  isNewArrival?: string;

  @IsOptional()
  @IsBooleanString()
  isFeatured?: string;

  @IsOptional()
  @IsNumberString()
  categoryId?: string;

  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsString()
  sortOrder?: string;
}

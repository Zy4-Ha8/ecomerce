import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { Gender } from 'src/enum/gender.enum';
import { Size } from 'src/Interfaces/size.interface';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsInt()
  @Transform(({ value }) => parseFloat(value))
  category_id: number;

  @IsString()
  @IsOptional()
  brand: string;

  @IsEnum(Gender)
  gender: Gender;

  @IsArray()
  @Type(() => String)
  @IsOptional()
  @Transform(({value}) => (typeof value === 'string' ? JSON.parse(value) : value))
  season: string[];

  @IsArray()
  @Type(() => String)
  @IsOptional()
  @Transform(({value}) => (typeof value === 'string' ? JSON.parse(value) : value))
  styleTags: string[];

  @IsArray()
  @IsOptional()
  @Transform(({value}) => (typeof value === 'string' ? JSON.parse(value) : value))
  sizes: Size[];

  @IsArray()
  @Type(() => String)
  @IsOptional()
  @Transform(({value}) => (typeof value === 'string' ? JSON.parse(value) : value))
  colors: string[];

  @IsNumber()
  @IsNotEmpty()
  @Transform(({ value }) => parseFloat(value))
  price: number;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  discountPrice: number;

  @IsInt()
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  stock: number;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  isAvailable: boolean;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  isBestSeller: boolean;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  isNewArrival: boolean;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  isFeatured: boolean;
}

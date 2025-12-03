import { Transform } from 'class-transformer';
import { IsBoolean, IsObject, IsOptional, IsString } from 'class-validator';
import { isUnique } from 'src/decorators/isUnique/isUnique';

export class CreateCategoryDto {
  @IsString()
  @isUnique({ tableName: 'category', column: 'name' })
  name: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsObject()
  image_url?: object | undefined;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return value;
  })
  is_active?: boolean;
}

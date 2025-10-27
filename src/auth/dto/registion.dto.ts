import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { isUnique } from 'src/decorators/isUnique/isUnique';
import { UserRole } from 'src/enum/user-role.enum';

export class RegistionDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @isUnique({ tableName: 'user', column: 'username' })
  username: string;

  @IsString()
  @IsNotEmpty()
  @isUnique({ tableName: 'user', column: 'email' })
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  userAvatar?: string | undefined;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}

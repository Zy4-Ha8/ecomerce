import { IsString } from 'class-validator';
export class LoginDto {
  username: string;

  @IsString()
  password: string;
}

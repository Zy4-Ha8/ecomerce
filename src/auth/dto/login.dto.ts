import { IsString } from 'class-validator';
export class Login {
  username: string;

  @IsString()
  password: string;
}

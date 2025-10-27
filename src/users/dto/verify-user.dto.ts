import { IsNumber, IsString } from 'class-validator';
import { buffer } from 'stream/consumers';

export class VerifyDtoId {
  @IsNumber()
  id: number;
}
export class VerifyDtoToken {
  @IsString()
  token: string;
}

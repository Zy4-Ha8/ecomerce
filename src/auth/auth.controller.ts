import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegistionDto } from './dto/registion.dto';
import { Login } from './dto/login.dto';
import { Public } from '../decorators/IsPublic.decorator';
import { NoAccout } from 'src/decorators/noAccount.decorator';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @NoAccout()
  @Public()
  @Post('registion')
  registion(@Body() registionDto: RegistionDto) {
    return this.authService.registion(registionDto);
  }
  @NoAccout()
  @Public()
  @Post('login')
  login(@Body() login: Login) {
    console.log(login);
    return this.authService.login(login);
  }
}

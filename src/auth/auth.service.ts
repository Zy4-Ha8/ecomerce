import { BadRequestException, Injectable } from '@nestjs/common';
import { RegistionDto } from './dto/registion.dto';
import { Login } from './dto/login.dto';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}
  async registion(registionDto: RegistionDto) {
    const isExist = await this.usersService.findOne(
      registionDto.username,
      false,
    );
    if (isExist) {
      throw new BadRequestException(
        `The username ${isExist.username} has been taken`,
      );
    }
    const { user } = await this.usersService.create(registionDto);
    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role,
      accountStatus: user.accountStatus,
      emailVerifiedAt: user.emailVerifiedAt,
    };

    return { user, access_token: await this.jwtService.signAsync(payload) };
  }

  async login(login: Login) {
    const user = await this.usersService.findOne(login.username, true);
    if (!user ) {
      throw new BadRequestException('the user not found');
    }
    const isMatch = await bcrypt.compare(login.password, String(user.password));
    if (!isMatch) {
      throw new BadRequestException(
        'the username or the password is incorrect',
      );
    }
    delete (user as any).password;
    const paylod = {
      sub: user.id,
      username: user.username,
      role: user.role,
      accountStatus: user.accountStatus,
      emailVerifiedAt: user.emailVerifiedAt,
    };
    return { user, access_token: await this.jwtService.signAsync(paylod) };
  }
}

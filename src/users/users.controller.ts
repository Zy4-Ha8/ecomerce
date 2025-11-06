import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinaryService.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/enum/user-role.enum';
import { Public } from 'src/decorators/IsPublic.decorator';
import { NoAccout } from 'src/decorators/noAccount.decorator';
import { VerifyDtoId, VerifyDtoToken } from './dto/verify-user.dto';
import { AuthGuard } from 'src/auth/guards/jwt.guard';
import { Request } from 'express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  create(
    @Body() createUserDto: CreateUserDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    console.log();
    return this.usersService.create(createUserDto, file);
  }
  @Roles(UserRole.ADMIN)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id, false);
  }
  @Get('profile')
  @UseGuards(AuthGuard)
  getProfile(@Req() req) {
    return this.usersService.findOne(req.user.id, false);
  }
  @Put(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
  @NoAccout()
  @Post('verification-otp')
  async generateEmailVerification(@Body() body: VerifyDtoId) {
    await this.usersService.emailVerification(body.id);
    return { status: 'success token has been send' };
  }
  @NoAccout()
  @Post('verify-otp/:token')
  async verifyOtp(@Body() body: VerifyDtoId, @Param('token') token: string) {
    await this.usersService.verifyEmail(+body.id, token);
    return { status: 'the email has been verified' };
  }
}

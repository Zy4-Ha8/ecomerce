import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CloudinaryService } from 'src/cloudinary/cloudinaryService.service';
import bcrypt from 'bcrypt';
import { VerificationService } from 'src/verification/verification.service';
import { MessagesService } from 'src/messages/messages.service';
import { AccountStatusEnum } from 'src/enum/AcountStatus.enum';
import { VerifyDtoToken } from './dto/verify-user.dto';
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    private cloudinary: CloudinaryService,
    private vertificationService: VerificationService,
    private messageService: MessagesService,
  ) {}
  async create(createUserDto: CreateUserDto, file?: Express.Multer.File) {
    const { name, email, username, password, role } = createUserDto;
    const avatarUrl = file
      ? await this.cloudinary.uploadImage(file, 'Avatars')
      : undefined;
    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(password, salt);
    const user = this.usersRepo.create({
      name,
      email,
      username,
      password: hashPassword,
      userAvatar: { url: avatarUrl?.url, public_id: avatarUrl?.publicId },
      role,
    });
    await this.usersRepo.save(user);

    delete (user as any).password;
    return { message: 'The user has been created', user };
  }

  async findAll() {
    return await this.usersRepo.find();
  }

  async findOne(username: string, selectSecrets?: boolean) {
    return await this.usersRepo.findOne({
      where: { username },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        userAvatar: true,
        emailVerifiedAt: true,
        accountStatus: true,
        password: selectSecrets,
      },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const currentUser = await this.usersRepo.findOneBy({ id });
    if (!currentUser) {
      return new NotFoundException({ massage: 'the user not found' });
    }
    Object.assign(currentUser, updateUserDto);
    console.log(currentUser);
    return await this.usersRepo.save(currentUser);
  }

  async remove(id: number) {
    const currentUser = await this.usersRepo.findOneBy({ id });
    if (!currentUser) {
      return new NotFoundException({ massage: 'the user not found' });
    }
    this.usersRepo.delete({ id: currentUser.id });
    return `the user with the id ${id} has been deleted`;
  }

  async emailVerification(userId: number) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) {
      return new NotFoundException('the user not found');
    }
    console.log(user.emailVerifiedAt);
    if (user.emailVerifiedAt !== null && user.emailVerifiedAt !== undefined) {
      throw new UnprocessableEntityException('the email already verified ');
    }

    const otp = await this.vertificationService.generateOTP(userId);

    this.messageService.sendEmail({
      subject: 'My APP - Account Verification',
      recipients: user.email, // Changed from recipients array to simple string
      html: `
  <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
    <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
      <h2 style="color: #333;">Your One-Time Password (OTP)</h2>
      <p style="font-size: 16px; color: #555;">
        Hello ${user.name},<br><br>
        Use the following OTP to verify your account. This code is valid for the next 5 minutes:
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <span style="display: inline-block; font-size: 32px; font-weight: bold; background-color: #f0f0f0; padding: 12px 24px; border-radius: 6px; letter-spacing: 4px;">
          ${otp}
        </span>
      </div>
      <p style="font-size: 14px; color: #999;">
        If you didn't request this, you can safely ignore this email.
      </p>
      <p style="font-size: 14px; color: #999;">
        — The My APP Team
      </p>
    </div>
  </div>
`,
    });
  }

  async verifyEmail(userId: number, token: string) {
    const invalidMessage = 'invalid or expired OTP';
    const user = await this.usersRepo.findOne({ where: { id: userId } });

    if (!user) {
      throw new UnprocessableEntityException(invalidMessage);
    }

    if (user.emailVerifiedAt) {
      throw new UnprocessableEntityException('email alread verified');
    }
    const isValid = await this.vertificationService.validateOTP(user.id, token);
    if (!isValid) {
      throw new UnprocessableEntityException('the token is invalid');
    }
    user.accountStatus = AccountStatusEnum.ACTIVE;
    user.emailVerifiedAt = new Date();
    await this.usersRepo.save(user);
    return true;
  }
}

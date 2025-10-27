import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateVerificationDto } from './dto/create-verification.dto';
import { UpdateVerificationDto } from './dto/update-verification.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Verification } from './entities/verification.entity';
import { MoreThan, Repository } from 'typeorm';
import { generateOTP } from './utils/otp.util';
import bcrypt from 'bcrypt';
import { VerifyDtoToken } from 'src/users/dto/verify-user.dto';
@Injectable()
export class VerificationService {
  constructor(
    @InjectRepository(Verification)
    private verificationRepo: Repository<Verification>,
  ) {}
  private readonly minRequestIntervalMinutes = 1;
  private readonly expirationMintues = 15;
  async generateOTP(userId: number, size = 6) {
    const oldOTP = await this.verificationRepo.findOne({ where: { userId } });
    if (oldOTP) {
      await this.verificationRepo.remove(oldOTP);
    }
    const now = new Date();
    const recentToken = await this.verificationRepo.findOne({
      where: {
        userId,
        createAt: MoreThan(
          new Date(now.getTime() - this.minRequestIntervalMinutes * 60 * 1000),
        ),
      },
    });

    if (recentToken) {
      throw new BadRequestException(
        'please wait a minute before requesting new token',
      );
    }

    const otp = generateOTP(size);
    const salt = bcrypt.genSaltSync();
    const hashToken = await bcrypt.hash(otp, salt);
    const tokenEntity = this.verificationRepo.create({
      userId,
      token: hashToken,
      expiredAt: new Date(now.getTime() + this.expirationMintues * 60 * 1000),
    });
    await this.verificationRepo.save(tokenEntity);

    return otp;
  }

  async validateOTP(userId: number, token: string) {
    const validToken = await this.verificationRepo.findOne({
      where: {
        userId,
        expiredAt: MoreThan(new Date()),
      },
      // order: {
      //   createAt: 'DESC',
      // },
    });
    console.log(userId, token, validToken);
    
    if (validToken && (await bcrypt.compare(token, validToken.token))) {
      await this.verificationRepo.remove(validToken);
      return true;
    } else {
      return false;
    }
  }
}

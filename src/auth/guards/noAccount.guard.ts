import { UsersService } from 'src/users/users.service';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { NO_ACCOUNT_KEY } from 'src/decorators/noAccount.decorator';
@Injectable()
export class noAccountGourd implements CanActivate {
  constructor(
    private reflector: Reflector,
    private userService: UsersService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride(NO_ACCOUNT_KEY, [
      context.getClass(),
      context.getHandler(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    if (!request.user || !request.user.username) {
      throw new UnauthorizedException('User not authenticated');
    }

    const user = await this.userService.findOne(request.user.username);

    if (user?.accountStatus !== 'Active') {
      console.log(user);
      throw new UnprocessableEntityException(
        `The Account ${user?.accountStatus}`,
      );
    }
    if (!user.emailVerifiedAt) {
      throw new UnprocessableEntityException(`Account Not Verified yet`);
    }

    return user.accountStatus === 'Active' && !!user.emailVerifiedAt;
  }
}

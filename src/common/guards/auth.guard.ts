import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

interface JwtPayload {
  user: {
    id: string;
    email: string;
    username: string;
  };
  token: string;
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = any>(err: any, user: TUser, info: any): TUser {
    if (err) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    if (info && info.name === 'TokenExpiredError') {
      throw new HttpException('Token has expired', HttpStatus.UNAUTHORIZED);
    }

    const extractedUser = (user as JwtPayload).user || user;

    if (!extractedUser.id || !extractedUser.email || !extractedUser.username) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    return user;
  }
}

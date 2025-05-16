import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma/prisma.service';

interface JwtPayload {
  userId: string;
  email: string;
}

@Injectable()
export class JwtAuthStrategy extends PassportStrategy(JwtStrategy, 'jwt') {
  private readonly logger = new Logger(JwtAuthStrategy.name);

  constructor(private readonly prisma: PrismaService) {
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      throw new HttpException(
        'JWT secret not set',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: JwtPayload) {
    if (!payload.userId) {
      throw new HttpException('Invalid token payload', HttpStatus.UNAUTHORIZED);
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.UNAUTHORIZED);
    }

    return user;
  }
}

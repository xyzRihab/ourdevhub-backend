import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { TokenType } from '@prisma/client';
import { PrismaService } from 'src/common/services/prisma/prisma.service';

@Injectable()
export class OtpService {
  constructor(private readonly prisma: PrismaService) {}

  generateOtp(): string {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    return otp;
  }

  async verifyOtp(email: string, otp: string): Promise<boolean> {
    const token = await this.prisma.token.findFirst({
      where: {
        user: { email },
        type: TokenType.Email,
        valid: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!token) {
      throw new HttpException(
        'Token not found or expired',
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (Date.now() > token.expiration.getTime()) {
      await this.prisma.token.update({
        where: { id: token.id },
        data: { valid: false },
      });
      return false;
    }

    if (token.emailToken === otp) {
      await this.prisma.token.update({
        where: { id: token.id },
        data: { valid: false },
      });
      return true;
    }

    return false;
  }
}

import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { OtpService } from './services/otp.service';
import { PrismaModule } from 'src/common/services/prisma/prisma.module';
import { AuthService } from './auth.service';
import { EmailService } from './services/email.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthStrategy } from '../../common/strategies/jwt.strategy';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '50min' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, OtpService, EmailService, JwtAuthStrategy],
})
export class AuthModule {}

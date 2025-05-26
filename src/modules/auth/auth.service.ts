import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma/prisma.service';
import { OtpService } from './services/otp.service';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { EmailService } from './services/email.service';
import { TokenType } from '@prisma/client';
import { ApiResponse } from 'src/common/interfaces/response.interface';

interface UserResponse {
  user: {
    id: string;
    email: string;
    username: string;
  };
  token: string;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private otpService: OtpService,
    private jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  async sendOtp(email: string): Promise<{ message: string }> {
    if (!email) {
      throw new HttpException('Email is required', HttpStatus.BAD_REQUEST);
    }
    const user = await this.prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        username: email.split('@')[0],
      },
    });

    const otp = this.otpService.generateOtp();
    console.log('Generated OTP:', otp);

    await this.prisma.token.create({
      data: {
        user: {
          connect: { id: user.id },
        },
        emailToken: otp,
        type: TokenType.Email,
        valid: true,
        expiration: new Date(Date.now() + 5 * 60 * 1000),
      },
    });

    await this.emailService.sendOtpEmail(email, otp);

    return {
      message: 'OTP sent successfully, please check your email.',
    };
  }

  async verifyOtp(
    email: string,
    otp: string,
  ): Promise<ApiResponse<UserResponse>> {
    const isValid = await this.otpService.verifyOtp(email, otp);

    if (!isValid) {
      throw new HttpException('Invalid OTP', HttpStatus.BAD_REQUEST);
    }

    const user = await this.prisma.user.findUnique({
      where: { email: email },
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const payload = { userId: user.id };
    const options: JwtSignOptions = { expiresIn: '30d' };
    const token = this.jwtService.sign(payload, options);

    return {
      message: 'OTP verified successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
        },
        token,
      },
    };
  }

  async oauth({
    userData,
  }: {
    userData: { email: string; name: string; image: string };
  }): Promise<ApiResponse<UserResponse>> {
    const { email, name, image } = userData;

    if (!email || !name) {
      throw new HttpException('Email is required', HttpStatus.BAD_REQUEST);
    }

    const user = await this.prisma.user.upsert({
      where: { email },
      update: {
        username: name,
        picture: image,
      },
      create: {
        email,
        username: name,
        picture: image,
      },
    });

    const payload = { userId: user.id };
    const options: JwtSignOptions = { expiresIn: '30d' };
    const token = this.jwtService.sign(payload, options);

    return {
      message: 'User authenticated successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
        },
        token,
      },
    };
  }
}

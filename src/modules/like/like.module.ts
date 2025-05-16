import { Module } from '@nestjs/common';
import { LikeService } from './like.service';
import { LikeController } from './like.controller';
import { PrismaModule } from 'src/common/services/prisma/prisma.module';
import { NotificationService } from '../notification/notification.service';
import { NotificationGateway } from '../notification/notification.gateway';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [PrismaModule],
  controllers: [LikeController],
  providers: [
    LikeService,
    NotificationService,
    NotificationGateway,
    JwtService,
  ],
})
export class LikeModule {}

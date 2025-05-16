import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { NotificationGateway } from './notification.gateway';
import { NotificationService } from './notification.service';
import { PrismaModule } from 'src/common/services/prisma/prisma.module';
import { NotificationController } from './notification.controller';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'supersecret',
      signOptions: { expiresIn: '1d' },
    }),
    PrismaModule,
  ],
  controllers: [NotificationController],
  providers: [NotificationGateway, NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}

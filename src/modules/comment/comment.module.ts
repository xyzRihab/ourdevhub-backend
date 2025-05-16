import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { PrismaModule } from 'src/common/services/prisma/prisma.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [PrismaModule, NotificationModule],
  controllers: [CommentController],
  providers: [CommentService],
})
export class CommentModule {}

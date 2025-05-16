import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/auth.guard';
import { NotificationService } from './notification.service';
import { NotificationType, User } from '@prisma/client';

@Controller('notification')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly NotificationService: NotificationService) {}

  @Post('send')
  sendNotification(
    @Request() req: { user: User },
    @Body()
    body: {
      userId: string;
      type: NotificationType;
      articleId: string;
      commentId?: string;
    },
  ) {
    return this.NotificationService.sendNotification(
      body.userId,
      req.user.id,
      body.articleId,
      body.type,
      body.commentId,
    );
  }

  @Get()
  getNotifications(@Request() req: { user: User }) {
    return this.NotificationService.getNotifications(req.user.id);
  }

  @Put('mark-as-read')
  markAsRead(
    @Request() req: { user: User },
    @Body() body: { notificationId: string },
  ) {
    return this.NotificationService.markAsRead(
      req.user.id,
      body.notificationId,
    );
  }

  @Put('mark-all-as-read')
  markAllAsRead(@Request() req: { user: User }) {
    return this.NotificationService.markAllAsRead(req.user.id);
  }
}

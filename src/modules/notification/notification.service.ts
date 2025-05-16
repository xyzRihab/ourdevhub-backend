/*eslint-disable*/
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { createId } from '@paralleldrive/cuid2';
import { NotificationGateway } from './notification.gateway';
import { PrismaService } from 'src/common/services/prisma/prisma.service';
import { NotificationType } from '@prisma/client';

const content = {
  [NotificationType.Like]: ' liked your article',
  [NotificationType.Comment]: ' commented on your article',
};

@Injectable()
export class NotificationService {
  constructor(
    private prisma: PrismaService,
    private gateway: NotificationGateway,
  ) {}

  async sendNotification(
    userId: string,
    senderId: string,
    articleId: string,
    type: NotificationType,
    commentId?: string,
    isMention: boolean = false,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new HttpException(
        `User with id ${userId} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    const sender = await this.prisma.user.findUnique({
      where: { id: senderId },
    });

    const formatContent = () => {
      switch (type) {
        case NotificationType.Like:
          return `Liked your article`;
        case NotificationType.Comment:
          return isMention
            ? `Mentioned you in a comment`
            : `Commented on your article`;
        case NotificationType.System:
          return `Sent a system notification`;
        default:
          return `${type}`;
      }
    };

    const notification = await this.prisma.notification.create({
      data: {
        userId: userId,
        senderId: senderId,
        articleId: articleId,
        commentId: commentId,
        type: type,
        content: formatContent(),
        isRead: false,
        createdAt: new Date(),
      },
    });

    this.gateway.sendToUser(userId, notification);

    return {
      message: 'Notification sent successfully',
      data: notification,
    };
  }

  async getNotifications(userId: string) {
    const notifications = await this.prisma.notification.findMany({
      where: { userId },
      include: {
        sender: true,
        article: {
          select: {
            id: true,
            title: true,
          },
        },
        comment: {
          select: {
            id: true,
            content: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      message: 'Notifications retrieved successfully',
      data: notifications,
    };
  }

  async markAsRead(userId: string, notificationId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });
    if (!notification) {
      throw new HttpException(
        `Notification with id ${notificationId} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    if (notification.userId !== userId) {
      throw new HttpException(
        'You are not authorized to mark this notification as read',
        HttpStatus.UNAUTHORIZED,
      );
    }
    await this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    return {
      message: 'Notification marked as read successfully',
      data: notification,
    };
  }

  async markAllAsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    return {
      message: 'All notifications marked as read successfully',
    };
  }
}

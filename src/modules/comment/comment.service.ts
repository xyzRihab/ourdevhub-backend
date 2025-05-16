import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { PrismaService } from 'src/common/services/prisma/prisma.service';
import { createId } from '@paralleldrive/cuid2';
import { Comment, NotificationType } from '@prisma/client';
import { NotificationService } from './../notification/notification.service';
import { ApiResponse } from 'src/common/interfaces/response.interface';

@Injectable()
export class CommentService {
  constructor(
    private prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  async create(
    createCommentDto: CreateCommentDto,
    userId: string,
    articleId: string,
  ): Promise<ApiResponse<Comment> | null> {
    const commentId = createId();

    const comment = await this.prisma.comment.create({
      data: {
        id: commentId,
        content: createCommentDto.content,
        articleId: articleId,
        userId: userId,
        mentions: createCommentDto.mentions?.length
          ? {
              connect: createCommentDto.mentions.map((id) => ({ id })),
            }
          : undefined,
      },
      include: {
        mentions: true,
      },
    });

    const article = await this.prisma.article.findUnique({
      where: { id: articleId },
      include: { author: true },
    });

    // Notify article author if not the commenter
    if (userId !== article?.authorId && article?.authorId) {
      await this.notificationService.sendNotification(
        article.authorId,
        userId,
        articleId,
        NotificationType.Comment,
        commentId,
      );
    }

    // Notify mentioned users (if any)
    if (createCommentDto.mentions?.length) {
      for (const mentionedUserId of createCommentDto.mentions) {
        if (mentionedUserId !== userId) {
          await this.notificationService.sendNotification(
            mentionedUserId,
            userId,
            articleId,
            NotificationType.Comment,
            commentId,
            true,
          );
        }
      }
    }

    return {
      message: 'Comment created successfully',
      data: comment,
    };
  }

  async findAll(): Promise<ApiResponse<Comment[]> | null> {
    const comments = await this.prisma.comment.findMany();
    return {
      message: 'Comments retrieved successfully',
      data: comments,
    };
  }

  async findOne(id: string): Promise<ApiResponse<Comment> | null> {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      throw new HttpException('Comment not found', HttpStatus.NOT_FOUND);
    }

    return {
      message: 'Comment retrieved successfully',
      data: comment,
    };
  }

  async update(
    id: string,
    updateCommentDto: UpdateCommentDto,
  ): Promise<ApiResponse<Comment> | null> {
    const comment = await this.prisma.comment.update({
      where: { id },
      data: {
        content: updateCommentDto.content,
      },
    });

    return {
      message: 'Comment updated successfully',
      data: comment,
    };
  }

  async remove(id: string): Promise<ApiResponse<null> | null> {
    await this.prisma.comment.delete({
      where: { id },
    });

    return {
      message: 'Comment deleted successfully',
      data: null,
    };
  }
}

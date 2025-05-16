import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateLikeDto } from './dto/create-like.dto';
import { PrismaService } from 'src/common/services/prisma/prisma.service';
import { createId } from '@paralleldrive/cuid2';
import { Article, Like, NotificationType } from '@prisma/client';
import { NotificationService } from '../notification/notification.service';
import { ApiResponse } from 'src/common/interfaces/response.interface';

@Injectable()
export class LikeService {
  constructor(
    private prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  async create(
    createLikeDto: CreateLikeDto,
    userId: string,
  ): Promise<ApiResponse<Like> | null> {
    const likeId = createId();

    const like = await this.prisma.like.create({
      data: {
        id: likeId,
        userId: userId,
        articleId: createLikeDto.articleId,
      },
    });

    const article = await this.prisma.article.findUnique({
      where: { id: createLikeDto.articleId },
      include: { author: true },
    });

    if (createLikeDto.userId !== article?.authorId) {
      if (article?.authorId) {
        await this.notificationService.sendNotification(
          article.authorId,
          userId,
          article.id,
          NotificationType.Like,
        );
      }
    }

    return {
      message: 'Like created successfully',
      data: like,
    };
  }

  async findAll(): Promise<ApiResponse<Like[]> | null> {
    const likes = await this.prisma.like.findMany();
    return {
      message: 'Likes retrieved successfully',
      data: likes,
    };
  }

  async findOne(id: string): Promise<ApiResponse<Like> | null> {
    const like = await this.prisma.like.findUnique({
      where: { id },
    });

    if (!like) {
      throw new HttpException(
        `Like with ID ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    return {
      message: 'Like retrieved successfully',
      data: like,
    };
  }

  async remove(articleId: string, userId: string): Promise<ApiResponse<null>> {
    const like = await this.prisma.like.findUnique({
      where: { userId_articleId: { userId, articleId } },
    });
    if (!like) {
      throw new HttpException('Like not found', HttpStatus.NOT_FOUND);
    }

    await this.prisma.like.delete({
      where: { userId_articleId: { userId, articleId } },
    });

    return {
      message: 'Like removed successfully',
      data: null,
    };
  }

  async getLikedArticlesByUser(
    userId: string,
  ): Promise<ApiResponse<Article[]> | null> {
    const likes = await this.prisma.like.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        article: true,
      },
    });

    const articles = likes.map((like) => like.article);

    return {
      message: 'Liked articles retrieved successfully',
      data: articles,
    };
  }
}

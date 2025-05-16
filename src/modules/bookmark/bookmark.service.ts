import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';
import { PrismaService } from 'src/common/services/prisma/prisma.service';
import { createId } from '@paralleldrive/cuid2';
import { Article, Bookmark } from '@prisma/client';
import { ApiResponse } from 'src/common/interfaces/response.interface';

@Injectable()
export class BookmarkService {
  constructor(private prisma: PrismaService) {}

  async create(
    createBookmarkDto: CreateBookmarkDto,
    userId: string,
  ): Promise<ApiResponse<Bookmark> | null> {
    const bookmarkId = createId();

    const bookmark = await this.prisma.bookmark.create({
      data: {
        id: bookmarkId,
        userId: userId,
        articleId: createBookmarkDto.articleId,
      },
    });

    return {
      message: 'Bookmark created successfully',
      data: bookmark,
    };
  }

  async findAll(): Promise<ApiResponse<Bookmark[]> | null> {
    const bookmarks = await this.prisma.bookmark.findMany();
    return {
      message: 'Bookmarks retrieved successfully',
      data: bookmarks,
    };
  }

  async findOne(id: string): Promise<ApiResponse<Bookmark> | null> {
    const bookmark = await this.prisma.bookmark.findUnique({
      where: { id },
    });

    if (!bookmark) {
      throw new HttpException('Bookmark not found', HttpStatus.NOT_FOUND);
    }

    return {
      message: 'Bookmark retrieved successfully',
      data: bookmark,
    };
  }

  async remove(
    articleId: string,
    userId: string,
  ): Promise<ApiResponse<null> | null> {
    const bookmark = await this.prisma.bookmark.findUnique({
      where: { userId_articleId: { articleId, userId } },
    });
    if (!bookmark) {
      throw new HttpException('Bookmark not found', HttpStatus.NOT_FOUND);
    }

    await this.prisma.bookmark.delete({
      where: { userId_articleId: { userId, articleId } },
    });

    return {
      message: 'Bookmark deleted successfully',
      data: null,
    };
  }

  async getBookmarkedArticlesByUser(
    userId: string,
  ): Promise<ApiResponse<Article[]> | null> {
    const bookmarks = await this.prisma.bookmark.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        article: {},
      },
    });

    const articles = bookmarks.map((bookmark) => bookmark.article);

    return {
      message: 'Bookmarked articles retrieved successfully',
      data: articles,
    };
  }
}

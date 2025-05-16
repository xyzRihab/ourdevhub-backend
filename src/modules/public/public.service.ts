import { Injectable } from '@nestjs/common';
import { Article } from '@prisma/client';
import { ApiResponse } from 'src/common/interfaces/response.interface';
import { PrismaService } from 'src/common/services/prisma/prisma.service';

const TRENDING_ARTICLES_TIMEFRAME = new Date();
TRENDING_ARTICLES_TIMEFRAME.setDate(TRENDING_ARTICLES_TIMEFRAME.getDate() - 3);

@Injectable()
export class PublicService {
  constructor(private prisma: PrismaService) {}

  async getLatestDeveloperNews(): Promise<ApiResponse<Article[]> | null> {
    const articles = await this.prisma.$queryRaw<Article[]>`
        SELECT * FROM "Article" 
        ORDER BY RANDOM()
        LIMIT 4
      `;
    return {
      message: 'Latest developer news retrieved successfully',
      data: articles,
    };
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ArticleService } from './article.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { Article, User } from '@prisma/client';
import { JwtAuthGuard } from 'src/common/guards/auth.guard';
import { ApiResponse } from 'src/common/interfaces/response.interface';
import { RecommendArticlesDto } from './dto/recommend-articles.dto';

@Controller('article')
@UseGuards(JwtAuthGuard)
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Post()
  create(
    @Request() req: { user: User },
    @Body() createArticleDto: CreateArticleDto,
  ): Promise<ApiResponse<Article> | null> {
    return this.articleService.create(req.user.id, createArticleDto);
  }

  @Get('recommendations')
  recommend(@Body() recommendArticlesDto: RecommendArticlesDto) {
    return this.articleService.recommend(recommendArticlesDto);
  }

  @Get('getRecommendedArticles')
  getRecommendedArticles(
    @Request() req: { user: User },
    @Query('page') page: number,
  ) {
    return this.articleService.getRecommendedArticles(req.user.id, page);
  }

  @Get('getArticleByTag')
  getArticleByTag(
    @Query('name') name: string,
  ): Promise<ApiResponse<Article[]> | null> {
    return this.articleService.getArticleByTag(name);
  }

  @Get()
  findAll(): Promise<ApiResponse<Article[]> | null> {
    return this.articleService.findAll();
  }

  @Get('import')
  importArticles(
    @Query('page') page: number = 1,
  ): Promise<ApiResponse<Article[]> | null> {
    return this.articleService.importDevtoArticles(page);
  }

  @Get('trendings')
  getTrendingArticles(): Promise<ApiResponse<Article[]> | null> {
    return this.articleService.getTrendingArticles();
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Request() req: { user: User },
  ): Promise<ApiResponse<
    Article & { isLiked: boolean } & { isSaved: boolean }
  > | null> {
    return this.articleService.findOne(id, req.user.id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateArticleDto: UpdateArticleDto,
  ): Promise<ApiResponse<Article> | null> {
    return this.articleService.update(id, updateArticleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<ApiResponse<null> | null> {
    return this.articleService.remove(id);
  }
}

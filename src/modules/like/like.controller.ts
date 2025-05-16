import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { LikeService } from './like.service';
import { CreateLikeDto } from './dto/create-like.dto';
import { Article, Like, User } from '@prisma/client';
import { JwtAuthGuard } from 'src/common/guards/auth.guard';
import { ApiResponse } from 'src/common/interfaces/response.interface';

@Controller('like')
@UseGuards(JwtAuthGuard)
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @Post()
  create(
    @Request() req: { user: User },
    @Body() createLikeDto: CreateLikeDto,
  ): Promise<ApiResponse<Like> | null> {
    return this.likeService.create(createLikeDto, req.user.id);
  }

  @Get()
  findAll(): Promise<ApiResponse<Like[]> | null> {
    return this.likeService.findAll();
  }

  @Get('history')
  getUserLikedArticles(
    @Request() req: { user: User },
  ): Promise<ApiResponse<Article[]> | null> {
    return this.likeService.getLikedArticlesByUser(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<ApiResponse<Like> | null> {
    return this.likeService.findOne(id);
  }

  @Delete()
  remove(
    @Request() req: { user: User },
    @Body('articleId') id: string,
  ): Promise<ApiResponse<null> | null> {
    return this.likeService.remove(id, req.user.id);
  }
}

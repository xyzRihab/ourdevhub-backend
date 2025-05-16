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
import { BookmarkService } from './bookmark.service';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';
import { Article, Bookmark, User } from '@prisma/client';
import { JwtAuthGuard } from 'src/common/guards/auth.guard';
import { ApiResponse } from 'src/common/interfaces/response.interface';

@Controller('bookmark')
@UseGuards(JwtAuthGuard)
export class BookmarkController {
  constructor(private readonly bookmarkService: BookmarkService) {}

  @Post()
  create(
    @Request() req: { user: User },
    @Body() createBookmarkDto: CreateBookmarkDto,
  ): Promise<ApiResponse<Bookmark> | null> {
    return this.bookmarkService.create(createBookmarkDto, req.user.id);
  }

  @Get()
  findAll(): Promise<ApiResponse<Bookmark[]> | null> {
    return this.bookmarkService.findAll();
  }

  @Get('history')
  getBookmarkedArticlesByUser(
    @Request() req: { user: User },
  ): Promise<ApiResponse<Article[]> | null> {
    return this.bookmarkService.getBookmarkedArticlesByUser(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<ApiResponse<Bookmark> | null> {
    return this.bookmarkService.findOne(id);
  }

  @Delete()
  remove(
    @Request() req: { user: User },
    @Body('articleId') id: string,
  ): Promise<ApiResponse<null> | null> {
    return this.bookmarkService.remove(id, req.user.id);
  }
}

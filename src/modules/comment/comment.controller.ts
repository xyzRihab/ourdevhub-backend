import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Comment, User } from '@prisma/client';
import { JwtAuthGuard } from 'src/common/guards/auth.guard';
import { ApiResponse } from 'src/common/interfaces/response.interface';

@Controller('comment')
@UseGuards(JwtAuthGuard)
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post(':id')
  create(
    @Request() req: { user: User },
    @Param('id') id: string,
    @Body() createCommentDto: CreateCommentDto,
  ): Promise<ApiResponse<Comment> | null> {
    return this.commentService.create(createCommentDto, req.user.id, id);
  }

  @Get()
  findAll(): Promise<ApiResponse<Comment[]> | null> {
    return this.commentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<ApiResponse<Comment> | null> {
    return this.commentService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
  ): Promise<ApiResponse<Comment> | null> {
    return this.commentService.update(id, updateCommentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<ApiResponse<null> | null> {
    return this.commentService.remove(id);
  }
}

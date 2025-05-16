import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TagService } from './tag.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { JwtAuthGuard } from 'src/common/guards/auth.guard';
import { PreferencesTagDto } from './dto/preferences-tag.dto';
import { User } from '@prisma/client';

@Controller('tag')
@UseGuards(JwtAuthGuard)
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Post()
  upsert(@Body() createTagDto: CreateTagDto) {
    return this.tagService.upsert(createTagDto);
  }

  @Get()
  findAll() {
    return this.tagService.findAll();
  }

  @Get('popular')
  getPopularTags() {
    return this.tagService.getPopularTags();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tagService.findOne(id);
  }

  @Post('preferences')
  getTagPreferences(
    @Request() req: { user: User },
    @Body() preferencesTagDto: PreferencesTagDto,
  ) {
    return this.tagService.getTagPreferences(req.user.id, preferencesTagDto);
  }
}

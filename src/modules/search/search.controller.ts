import { Controller, Get, Query, Post, Body, UseGuards } from '@nestjs/common';
import { ElasticsearchService } from './elasticsearch.service';
import { JwtAuthGuard } from 'src/common/guards/auth.guard';

@Controller('search')
@UseGuards(JwtAuthGuard)
export class SearchController {
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  @Get('articles')
  async search(@Query('q') query: string) {
    return this.elasticsearchService.searchArticles(query);
  }

  @Post('articles')
  async indexArticle(@Body() article: { [key: string]: any; id: string }) {
    return this.elasticsearchService.indexArticle(article);
  }
}

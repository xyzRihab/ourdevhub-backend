import { Module } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { ElasticsearchService } from './elasticsearch.service';
import { SearchController } from './search.controller';

@Module({
  imports: [
    ElasticsearchModule.register({
      node: process.env.ELASTICSEARCH_URL,
    }),
  ],
  controllers: [SearchController],
  providers: [ElasticsearchService],
  exports: [ElasticsearchService],
})
export class SearchModule {}

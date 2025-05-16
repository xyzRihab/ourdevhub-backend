import { Module } from '@nestjs/common';
import { ArticleService } from './article.service';
import { ArticleController } from './article.controller';
import { PrismaModule } from 'src/common/services/prisma/prisma.module';
import { HttpModule } from '@nestjs/axios';
import { DevtoService } from './devto/devto.service';
import { OpenaiService } from 'src/common/services/openai.service';
import { PineconeService } from 'src/common/services/pinecone.service';
import { SearchModule } from '../search/search.module';

@Module({
  imports: [PrismaModule, HttpModule, SearchModule],
  controllers: [ArticleController],
  providers: [ArticleService, DevtoService, OpenaiService, PineconeService],
})
export class ArticleModule {}

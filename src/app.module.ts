import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ArticleModule } from './modules/article/article.module';
import { EventModule } from './modules/event/event.module';
import { AuthModule } from './modules/auth/auth.module';
import { BookmarkModule } from './modules/bookmark/bookmark.module';
import { CommentModule } from './modules/comment/comment.module';
import { LikeModule } from './modules/like/like.module';
import { TagModule } from './modules/tag/tag.module';
import { NotificationModule } from './modules/notification/notification.module';
import { ClientModule } from './modules/client/client.module';
import { OpenaiModule } from './modules/openai/openai.module';
import { SummarizeModule } from './modules/summarize/summarize.module';
import { SearchModule } from './modules/search/search.module';
import { PublicModule } from './modules/public/public.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ArticleModule,
    EventModule,
    AuthModule,
    BookmarkModule,
    CommentModule,
    LikeModule,
    TagModule,
    NotificationModule,
    ClientModule,
    OpenaiModule,
    SummarizeModule,
    SearchModule,
    PublicModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

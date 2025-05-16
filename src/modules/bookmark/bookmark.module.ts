import { Module } from '@nestjs/common';
import { BookmarkService } from './bookmark.service';
import { BookmarkController } from './bookmark.controller';
import { PrismaModule } from 'src/common/services/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BookmarkController],
  providers: [BookmarkService],
})
export class BookmarkModule {}

import { Module } from '@nestjs/common';
import { TagService } from './tag.service';
import { TagController } from './tag.controller';
import { PrismaModule } from 'src/common/services/prisma/prisma.module';
import { OpenaiService } from 'src/common/services/openai.service';
import { PineconeService } from 'src/common/services/pinecone.service';

@Module({
  imports: [PrismaModule],
  controllers: [TagController],
  providers: [TagService, OpenaiService, PineconeService],
})
export class TagModule {}

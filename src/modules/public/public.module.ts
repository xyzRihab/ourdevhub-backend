import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/common/services/prisma/prisma.module';
import { PublicController } from './public.controller';
import { PublicService } from './public.service';

@Module({
  imports: [PrismaModule],
  controllers: [PublicController],
  providers: [PublicService],
})
export class PublicModule {}

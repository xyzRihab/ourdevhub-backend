import { Module } from '@nestjs/common';
import { SummarizeService } from './summarize.service';
import { SummarizeController } from './summarize.controller';


@Module({
  providers: [SummarizeService],
  controllers: [SummarizeController],
})
export class SummarizeModule {}

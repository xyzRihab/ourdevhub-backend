import { Module } from '@nestjs/common';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { PrismaModule } from 'src/common/services/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [EventController],
  providers: [EventService],
})
export class EventModule {}

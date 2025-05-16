import { Module } from '@nestjs/common';
import { ClientService } from './client.service';
import { ClientController } from './client.controller';
import { PrismaModule } from 'src/common/services/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ClientController],
  providers: [ClientService],
})
export class ClientModule {}

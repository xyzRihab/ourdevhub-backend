import {
  Controller,
  Get,
  UseGuards,
  Request,
  Put,
  Body,
  Query,
} from '@nestjs/common';
import { ClientService } from './client.service';

import { User } from '@prisma/client';
import { JwtAuthGuard } from 'src/common/guards/auth.guard';
import { UpdateClientDto } from './dto/update-client.dto';

@Controller('client')
@UseGuards(JwtAuthGuard)
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Get()
  getProfile(@Request() req: { user: User }) {
    return this.clientService.getProfile(req.user.id);
  }

  @Put()
  update(
    @Request() req: { user: User },
    @Body() updateClientDto: UpdateClientDto,
  ) {
    return this.clientService.update(req.user.id, updateClientDto);
  }

  @Put('delete')
  delete(@Request() req: { user: User }) {
    return this.clientService.delete(req.user.id);
  }

  @Get('search')
  searchUsers(@Query('query') query: string) {
    if (!query || query.length < 1) return [];

    return this.clientService.searchByUsername(query);
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  Request,
} from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Event, User } from '@prisma/client';
import { JwtAuthGuard } from 'src/common/guards/auth.guard';
import { ApiResponse } from 'src/common/interfaces/response.interface';

@Controller('event')
@UseGuards(JwtAuthGuard)
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  create(
    @Request() req: { user: User },
    @Body() createEventDto: CreateEventDto,
  ): Promise<ApiResponse<Event> | null> {
    return this.eventService.create(createEventDto, req.user.id);
  }

  @Get()
  findAll(): Promise<ApiResponse<Event[]> | null> {
    return this.eventService.findAll();
  }

  @Get('mostAttended')
  findMostAttended(): Promise<ApiResponse<Event[]> | null> {
    return this.eventService.findMostAttended();
  }

  @Get('hosting')
  findHosting(
    @Request() req: { user: User },
  ): Promise<ApiResponse<Event[]> | null> {
    return this.eventService.findHosting(req.user.id);
  }

  @Get('attending')
  findAttending(
    @Request() req: { user: User },
  ): Promise<ApiResponse<Event[]> | null> {
    return this.eventService.findAttending(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<ApiResponse<Event> | null> {
    return this.eventService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
  ): Promise<ApiResponse<Event> | null> {
    return this.eventService.update(id, updateEventDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<ApiResponse<null> | null> {
    return this.eventService.remove(id);
  }

  @Post(':id/attend')
  attend(@Request() req: { user: User }, @Param('id') id: string) {
    return this.eventService.attend(id, req.user.id);
  }
  @Post(':id/unattend')
  unattend(@Request() req: { user: User }, @Param('id') id: string) {
    return this.eventService.unattend(id, req.user.id);
  }
}

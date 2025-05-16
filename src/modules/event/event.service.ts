import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { PrismaService } from 'src/common/services/prisma/prisma.service';
import { createId } from '@paralleldrive/cuid2';
import { Event } from '@prisma/client';
import { ApiResponse } from 'src/common/interfaces/response.interface';

@Injectable()
export class EventService {
  constructor(private prisma: PrismaService) {}
  async create(
    createEventDto: CreateEventDto,
    userId: string,
  ): Promise<ApiResponse<Event> | null> {
    const eventId = createId();

    const tags = await Promise.all(
      createEventDto.tags.map(async (tagName) => {
        const normalizedTag = tagName.toLowerCase();
        return this.prisma.tag.upsert({
          where: { name: normalizedTag },

          update: { count: { increment: 1 } },
          create: { name: normalizedTag, count: 1 },
        });
      }),
    );

    const event = await this.prisma.event.create({
      data: {
        id: eventId,
        title: createEventDto.title,
        content: createEventDto.content,
        image: createEventDto.image,
        eventDate: createEventDto.eventDate,
        location: createEventDto.location,
        url: createEventDto.url,
        maxAttendees: createEventDto.maxAttendees,
        EventTag: {
          create: tags.map((tag) => ({
            tag: { connect: { id: tag.id } },
          })),
        },
        engagements: {
          create: {
            userId,
            role: 'Author',
          },
        },
      },
    });

    return {
      message: 'Event created successfully',
      data: event,
    };
  }

  async findAll(): Promise<ApiResponse<Event[]> | null> {
    const events = await this.prisma.event.findMany({
      where: { deletedAt: null },
      include: {
        engagements: {
          where: {
            role: 'Author',
            deletedAt: null,
          },
          select: {
            user: {
              select: {
                id: true,
                username: true,
                picture: true,
                email: true,
              },
            },
            role: true,
          },
        },
      },
    });

    return {
      message: 'Events retrieved successfully',
      data: events,
    };
  }

  async findOne(id: string): Promise<ApiResponse<Event> | null> {
    const event = await this.prisma.event.findUnique({
      where: { id, deletedAt: null },
    });

    if (!event) {
      throw new HttpException(
        `Event with ID ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    return {
      message: 'Event retrieved successfully',
      data: event,
    };
  }

  async update(
    id: string,
    updateEventDto: UpdateEventDto,
  ): Promise<ApiResponse<Event> | null> {
    const event = await this.prisma.event.update({
      where: { id },
      data: {
        title: updateEventDto.title,
        content: updateEventDto.content,
        eventDate: updateEventDto.eventDate,
        url: updateEventDto.url,
        maxAttendees: updateEventDto.maxAttendees,
      },
    });

    if (!event || event.deletedAt) {
      throw new HttpException(
        `Event with ID ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    return {
      message: 'Event updated successfully',
      data: event,
    };
  }

  async remove(id: string): Promise<ApiResponse<null> | null> {
    const event = await this.prisma.event.findUnique({
      where: { id, deletedAt: null },
    });

    if (!event || event.deletedAt) {
      throw new HttpException(
        `Event with ID ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    await this.prisma.event.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return {
      message: 'Event deleted successfully',
      data: null,
    };
  }

  async findMostAttended(): Promise<ApiResponse<Event[]> | null> {
    const events = await this.prisma.event.findMany({
      where: { deletedAt: null },
      include: {
        engagements: {
          where: {
            role: 'Attendee',
            deletedAt: null,
          },
          select: { userId: true },
        },
      },
    });

    const sortedEvents = events
      .map((event) => ({
        ...event,
        attendeeCount: event.engagements.length,
      }))
      .sort((a, b) => b.attendeeCount - a.attendeeCount)
      .slice(0, 1);

    return {
      message: 'Most attended events retrieved successfully',
      data: sortedEvents,
    };
  }

  async attend(eventId: string, userId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId, deletedAt: null },
      include: {
        engagements: {
          where: {
            role: 'Attendee',
            deletedAt: null,
          },
          select: {
            userId: true,
          },
        },
      },
    });

    if (!event) {
      throw new HttpException(
        `Event with ID ${eventId} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    if (
      event.maxAttendees !== null &&
      event.engagements.length >= event.maxAttendees
    ) {
      throw new HttpException(
        `Event with ID ${eventId} is full`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const alreadyAttending = await this.prisma.eventEngagement.findUnique({
      where: {
        userId_eventId: { userId, eventId },
      },
    });

    if (alreadyAttending) {
      throw new HttpException(
        `User is already attending this event`,
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.prisma.eventEngagement.create({
      data: {
        userId,
        eventId,
        role: 'Attendee',
      },
    });

    const updatedEvent = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    return {
      message: 'Successfully attended the event',
      data: updatedEvent,
    };
  }

  async unattend(eventId: string, userId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId, deletedAt: null },
    });

    if (!event) {
      throw new HttpException(
        `Event with ID ${eventId} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    await this.prisma.eventEngagement.deleteMany({
      where: {
        userId,
        eventId,
        role: 'Attendee',
      },
    });

    const updatedEvent = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    return {
      message: 'Successfully unattended the event',
      data: updatedEvent,
    };
  }

  async findHosting(userId: string): Promise<ApiResponse<Event[]> | null> {
    const events = await this.prisma.event.findMany({
      where: {
        deletedAt: null,
        engagements: {
          some: {
            userId,
            role: 'Author',
            deletedAt: null,
          },
        },
      },
      include: {
        engagements: {
          where: {
            role: 'Author',
            deletedAt: null,
          },
          select: {
            userId: true,
            role: true,
          },
        },
      },
    });

    return {
      message: 'Events hosted by user retrieved successfully',
      data: events,
    };
  }

  async findAttending(userId: string): Promise<ApiResponse<Event[]> | null> {
    const events = await this.prisma.event.findMany({
      where: {
        deletedAt: null,
        engagements: {
          some: {
            userId,
            role: 'Attendee',
            deletedAt: null,
          },
        },
      },
      include: {
        engagements: {
          where: {
            role: 'Attendee',
            deletedAt: null,
          },
          select: {
            userId: true,
            role: true,
          },
        },
      },
    });

    return {
      message: 'Events attended by user retrieved successfully',
      data: events,
    };
  }
}

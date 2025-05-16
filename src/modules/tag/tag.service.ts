import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateTagDto } from './dto/create-tag.dto';
import { PrismaService } from 'src/common/services/prisma/prisma.service';
import { PreferencesTagDto } from './dto/preferences-tag.dto';
import { OpenaiService } from 'src/common/services/openai.service';
import { PineconeService } from 'src/common/services/pinecone.service';

@Injectable()
export class TagService {
  constructor(
    private prisma: PrismaService,
    private openaiService: OpenaiService,
    private pineconeService: PineconeService,
  ) {}
  async upsert(createTagDto: CreateTagDto) {
    const normalized = createTagDto.name.toLowerCase();

    const tag = await this.prisma.tag.upsert({
      where: { name: normalized },
      update: { count: { increment: 1 } },
      create: { name: normalized, count: 1 },
    });

    const embedding = await this.openaiService.generateEmbedding(normalized);

    await this.pineconeService.upsert(
      tag.id,
      embedding,
      { name: tag.name },
      'tags',
    );

    return {
      message: 'Tag upserted successfully',
      data: tag,
    };
  }

  async findAll() {
    const tags = await this.prisma.tag.findMany();
    return {
      message: 'Tags retrieved successfully',
      data: tags,
    };
  }

  async findOne(id: string) {
    const tag = await this.prisma.tag.findUnique({
      where: { id },
    });

    if (!tag) {
      throw new HttpException(
        `Tag with ID ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    return {
      message: 'Tag retrieved successfully',
      data: tag,
    };
  }

  async getTagPreferences(
    userId: string,
    preferencesTagDto: PreferencesTagDto,
  ) {
    const matchedTags = await this.prisma.tag.findMany({
      where: { name: { in: preferencesTagDto.names } },
      select: { id: true, name: true },
    });

    const userEmbedding = await this.openaiService.generateEmbedding(
      matchedTags.map((tag) => tag.name).join(', '),
    );

    if (userEmbedding.length) {
      await this.pineconeService.upsert(
        userId,
        userEmbedding,
        { name: userId },
        'users',
      );
    }

    const userTagLinks = await Promise.all(
      matchedTags.map((tag) =>
        this.prisma.userTag.upsert({
          where: {
            userId_tagId: {
              userId,
              tagId: tag.id,
            },
          },
          update: {},
          create: {
            userId,
            tagId: tag.id,
          },
        }),
      ),
    );

    return {
      message: 'Tag preferences set successfully',
      data: userTagLinks,
    };
  }

  async getPopularTags() {
    const popularTags = await this.prisma.tag.findMany({
      orderBy: {
        count: 'desc',
      },
      take: 9,
    });
    return {
      message: 'Popular tags retrieved successfully',
      data: popularTags,
    };
  }
}

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { RecommendArticlesDto } from './dto/recommend-articles.dto';
import { PrismaService } from 'src/common/services/prisma/prisma.service';
import { createId } from '@paralleldrive/cuid2';
import { Article } from '@prisma/client';
import { DevtoService } from './devto/devto.service';
import { ApiResponse } from 'src/common/interfaces/response.interface';
import { OpenaiService } from 'src/common/services/openai.service';
import { PineconeService } from 'src/common/services/pinecone.service';
import { ElasticsearchService } from '../search/elasticsearch.service';

const BATCH_SIZE = 10;
const TRENDING_ARTICLES_TIMEFRAME = new Date();
TRENDING_ARTICLES_TIMEFRAME.setDate(TRENDING_ARTICLES_TIMEFRAME.getDate() - 10);

@Injectable()
export class ArticleService {
  constructor(
    private prisma: PrismaService,
    private readonly devtoService: DevtoService,
    private readonly openaiService: OpenaiService,
    private readonly pineconeService: PineconeService,
    private readonly elasticsearchService: ElasticsearchService,
  ) {}

  async create(
    userId: string,
    createArticleDto: CreateArticleDto,
  ): Promise<ApiResponse<Article> | null> {
    console.log('Creating article:', createArticleDto);

    if (!createArticleDto.tags || createArticleDto.tags.length < 3) {
      throw new HttpException(
        'You must provide at least 3 tags.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const articleId = createId();

    const tags = await Promise.all(
      createArticleDto.tags.map(async (tagName) => {
        const normalizedTag = tagName.toLowerCase();
        return this.prisma.tag.upsert({
          where: { name: normalizedTag },
          update: { count: { increment: 1 } },
          create: { name: normalizedTag, count: 1 },
        });
      }),
    );

    const article = await this.prisma.article.create({
      data: {
        id: articleId,
        title: createArticleDto.title,
        content: createArticleDto.content,
        image: createArticleDto.image,
        url: createArticleDto.url,
        ...(userId && {
          author: {
            connect: { id: userId },
          },
        }),
        ArticleTag: {
          create: tags.map((tag) => ({
            tag: { connect: { id: tag.id } },
          })),
        },
      },
      include: {
        ArticleTag: { include: { tag: true } },
      },
    });

    const embedding = await this.openaiService.generateEmbedding(
      createArticleDto.tags.join(', '),
    );

    await this.pineconeService.upsert(
      article.id,
      embedding,
      {
        title: article.title,
        userId,
      },
      'articles',
    );
    await this.elasticsearchService.indexArticle(article);

    return {
      message: 'Article created successfully',
      data: article,
    };
  }

  async recommend(dto: RecommendArticlesDto) {
    const { content } = dto;

    const embedding = await this.openaiService.generateEmbedding(content);

    const similarArticles = await this.pineconeService.query(
      embedding,
      3,
      'articles',
    );

    const articleIds = similarArticles.map((result) => result.id);

    const articles = await this.prisma.article.findMany({
      where: { id: { in: articleIds } },
      include: {
        author: true,
        ArticleTag: { include: { tag: true } },
        Comment: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            userId: true,
            user: {
              select: {
                username: true,
                picture: true,
              },
            },
          },
        },
      },
    });

    return {
      message: 'Articles retrieved successfully',
      data: articles,
    };
  }

  async getRecommendedArticles(userId: string, page = 1, limit = 12) {
    const response = await this.pineconeService.fetchVectorById(
      userId,
      'users',
    );
    const recordKey = Object.keys(response.records)[0];
    const record = response.records[recordKey];
    const userEmbedding = record?.values;

    if (!userEmbedding) {
      throw new HttpException(
        'User or profile embedding not found.',
        HttpStatus.NOT_FOUND,
      );
    }

    const rawpineconeResults = await this.pineconeService.query(
      userEmbedding,
      50,
      'articles',
    );

    const ids = rawpineconeResults.map((r) => r.id);

    const articles = await this.prisma.article.findMany({
      where: { id: { in: ids } },
      include: {
        author: true,
        ArticleTag: { include: { tag: true } },
        Comment: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            userId: true,
            user: {
              select: {
                username: true,
                picture: true,
              },
            },
          },
        },
      },
    });

    // Keep the order based on Pinecone similarity
    const orderedArticles = ids
      .map((id) => articles.find((article) => article.id === id))
      .filter(Boolean);

    const total = orderedArticles.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedArticles = orderedArticles.slice(start, end);

    const articlesWithCounts = await Promise.all(
      paginatedArticles.map(async (article) => ({
        ...article,
        _count: {
          Like: await this.prisma.like.count({
            where: { articleId: article?.id },
          }),
          Comment: await this.prisma.comment.count({
            where: { articleId: article?.id },
          }),
          Bookmark: await this.prisma.bookmark.count({
            where: { articleId: article?.id },
          }),
        },
      })),
    );

    return {
      message: 'Recommended articles retrieved successfully.',
      data: articlesWithCounts,
      pagination: {
        total,
        page,
        limit,
        hasNextPage: end < total,
      },
    };
  }

  async findAll(): Promise<ApiResponse<Article[]> | null> {
    const articles = await this.prisma.article.findMany({
      where: { deletedAt: null },
      include: {
        author: {
          select: {
            username: true,
            picture: true,
          },
        },
        ArticleTag: {
          include: { tag: true },
        },
        Comment: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            userId: true,
            user: {
              select: {
                username: true,
                picture: true,
              },
            },
          },
        },
      },
    });

    return {
      message: 'Articles retrieved successfully',
      data: articles,
    };
  }

  async findOne(
    id: string,
    userId: string,
  ): Promise<ApiResponse<
    Article & { isLiked: boolean } & { isSaved: boolean }
  > | null> {
    const article = await this.prisma.article.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        author: {
          select: {
            username: true,
            picture: true,
          },
        },
        ArticleTag: {
          include: { tag: true },
        },
        Comment: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            userId: true,
            user: {
              select: {
                username: true,
                picture: true,
              },
            },
          },
        },
      },
    });

    if (!article) {
      throw new HttpException(
        `Article with ID ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    const like = await this.prisma.like.findUnique({
      where: {
        userId_articleId: { userId, articleId: id },
      },
    });
    const isLiked = Boolean(like);

    const bookmark = await this.prisma.bookmark.findUnique({
      where: {
        userId_articleId: { userId, articleId: id },
      },
    });
    const isSaved = Boolean(bookmark);

    return {
      message: 'Article retrieved successfully',
      data: { ...article, isLiked, isSaved },
    };
  }

  async update(
    id: string,
    updateArticleDto: UpdateArticleDto,
  ): Promise<ApiResponse<Article> | null> {
    const existingArticle = await this.prisma.article.findUnique({
      where: { id, deletedAt: null },
    });
    if (!existingArticle) {
      throw new HttpException(
        `Article with ID ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    const article = await this.prisma.article.update({
      where: { id },
      data: {
        title: updateArticleDto.title,
        content: updateArticleDto.content,
        url: updateArticleDto.url,
      },
      include: {
        ArticleTag: { include: { tag: true } },
      },
    });
    await this.elasticsearchService.indexArticle(article);

    return {
      message: 'Article updated successfully',
      data: article,
    };
  }

  async remove(id: string): Promise<ApiResponse<null> | null> {
    const article = await this.prisma.article.findUnique({
      where: { id, deletedAt: null },
    });

    if (!article) {
      throw new HttpException(
        `Article with ID ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    await this.prisma.article.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    await this.elasticsearchService.deleteArticle(id);

    return {
      message: 'Article deleted successfully',
      data: null,
    };
  }

  async importDevtoArticles(
    page: number = 1,
  ): Promise<ApiResponse<Article[]> | null> {
    const importedArticles: Article[] = [];

    while (importedArticles.length < BATCH_SIZE) {
      const devtoArticles = await this.devtoService.getArticles(
        page,
        BATCH_SIZE,
      );

      if (!devtoArticles.length) break;

      const newArticles = devtoArticles.filter(
        (article) => article.cover_image,
      );

      const existingUrls = new Set(
        (
          await this.prisma.article.findMany({
            where: { url: { in: newArticles.map((a) => a.url) } },
            select: { url: true },
          })
        ).map((a) => a.url),
      );

      const articlesToCreate = newArticles
        .filter((article) => !existingUrls.has(article.url))
        .map((article) => ({
          id: article.id,
          title: article.title,
          content: article.description,
          image: article.cover_image,
          url: article.url,
          tags: article.tag_list.map((tag) => tag.toLowerCase()),
          createdAt: new Date(article.created_at),
        }));

      if (articlesToCreate.length > 0) {
        for (const article of articlesToCreate) {
          const tags = await Promise.all(
            article.tags.map(async (tagName) => {
              const existingTag = await this.prisma.tag.findUnique({
                where: { name: tagName },
              });

              if (existingTag) {
                return this.prisma.tag.update({
                  where: { name: tagName },
                  data: { count: { increment: 1 } },
                });
              } else {
                const embedding =
                  await this.openaiService.generateEmbedding(tagName);

                const tagId = createId();

                await this.pineconeService.upsert(
                  tagId,
                  embedding,
                  { name: tagName },
                  'tags',
                );

                return this.prisma.tag.create({
                  data: {
                    id: tagId,
                    name: tagName,
                    count: 1,
                  },
                });
              }
            }),
          );

          const createdArticle = await this.prisma.article.create({
            data: {
              id: article.id.toString(),
              title: article.title,
              content: article.content,
              image: article.image,
              url: article.url,
              createdAt: article.createdAt,
              ArticleTag: {
                create: tags.map((tag) => ({
                  tag: { connect: { id: tag.id } },
                })),
              },
            },
          });
          await this.elasticsearchService.indexArticle(createdArticle);

          const bodyMarkdown = await this.devtoService.getBodyMarkdown(
            article.id.toString(),
          );
          await this.prisma.article.update({
            where: { id: article.id.toString() },
            data: {
              fullContent: bodyMarkdown.body_markdown,
            },
          });

          const embedding = await this.openaiService.generateEmbedding(
            article.tags.join(', '),
          );

          await this.pineconeService.upsert(
            createdArticle.id,
            embedding,
            {
              title: createdArticle.title,
            },
            'articles',
          );

          importedArticles.push(createdArticle);
        }

        if (importedArticles.length >= BATCH_SIZE) break;
      }

      page++;
    }

    return {
      message: 'Articles imported successfully',
      data: importedArticles,
    };
  }

  async getTrendingArticles(): Promise<ApiResponse<Article[]> | null> {
    const trendingArticles = await this.prisma.article.findMany({
      include: {
        author: true,
        _count: {
          select: {
            Like: {
              where: { createdAt: { gte: TRENDING_ARTICLES_TIMEFRAME } },
            },
            Comment: {
              where: { createdAt: { gte: TRENDING_ARTICLES_TIMEFRAME } },
            },
            Bookmark: {
              where: { createdAt: { gte: TRENDING_ARTICLES_TIMEFRAME } },
            },
          },
        },
      },
      orderBy: [
        { Like: { _count: 'desc' } },
        { Comment: { _count: 'desc' } },
        { Bookmark: { _count: 'desc' } },
      ],
      take: 10,
    });

    return {
      message: 'Trending articles retrieved successfully',
      data: trendingArticles,
    };
  }

  getArticleByTag = async (
    tag: string,
  ): Promise<ApiResponse<Article[]> | null> => {
    const articles = await this.prisma.article.findMany({
      where: {
        deletedAt: null,
        ArticleTag: {
          some: {
            tag: {
              name: tag,
            },
          },
        },
      },
      include: {
        author: true,
        ArticleTag: { include: { tag: true } },
        Comment: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            userId: true,
            user: {
              select: {
                username: true,
                picture: true,
              },
            },
          },
        },
      },
    });

    return {
      message: 'Articles retrieved successfully',
      data: articles,
    };
  };
}

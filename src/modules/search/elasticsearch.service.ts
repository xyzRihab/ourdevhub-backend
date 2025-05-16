/* eslint-disable */
import {
  HttpException,
  HttpStatus,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { Client } from '@elastic/elasticsearch';

function isElasticsearchError(
  error: unknown,
): error is { meta?: { body?: { found?: boolean } } } {
  return typeof error === 'object' && error !== null && 'meta' in error;
}

@Injectable()
export class ElasticsearchService implements OnModuleInit {
  private readonly esClient: Client;

  constructor() {
    this.esClient = new Client({ node: process.env.ELASTICSEARCH_URL });
  }

  async onModuleInit() {
    const exists = await this.esClient.indices.exists({ index: 'articles' });
    if (!exists) {
      await this.esClient.indices.create({
        index: 'articles',
        mappings: {
          properties: {
            id: { type: 'keyword' },
            title: { type: 'text' },
            content: { type: 'text' },
            tags: { type: 'keyword' },
            authorId: { type: 'keyword' },
            createdAt: { type: 'date' },
          },
        },
      });
    }
  }

  async indexArticle(article: { id: string; [key: string]: any }) {
    return this.esClient.index({
      index: 'articles',
      id: article.id,
      document: article,
    });
  }

  async searchArticles(query: string) {
    const { hits } = await this.esClient.search({
      index: 'articles',
      query: {
        multi_match: {
          query,
          fields: ['title^3', 'content'],
        },
      },
    });

    return {
      message: 'Articles retrieved successfully',
      data: hits.hits.map((hit) => hit._source),
    };
  }

  async deleteArticle(id: string): Promise<void> {
    try {
      await this.esClient.delete({
        index: 'articles',
        id,
      });
    } catch (error: unknown) {
      if (isElasticsearchError(error) && error.meta?.body?.found === false) {
        console.warn(
          `Article ${id} not found in Elasticsearch. Skipping deletion.`,
        );
      } else {
        console.error(
          `Failed to delete article ${id} from Elasticsearch`,
          error,
        );
        throw new HttpException(
          'Failed to delete article from Elasticsearch',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
}

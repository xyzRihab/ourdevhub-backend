import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { DevtoArticle, DevtoArticleBodyMarkdown } from './devto.interface';

const DEFAULT_PAGE = 1;
const DEFAULT_ARTICLES_PER_PAGE = 10;
const DEV_API_BASE_URL = 'https://dev.to/api';
const ARTICLES_ENDPOINT = '/articles';

@Injectable()
export class DevtoService {
  constructor(private readonly httpService: HttpService) {}

  async getArticles(
    page: number = DEFAULT_PAGE,
    perPage: number = DEFAULT_ARTICLES_PER_PAGE,
  ): Promise<DevtoArticle[]> {
    const url = `https://dev.to/api/articles?page=${page}&per_page=${perPage}`;
    const response = await firstValueFrom(this.httpService.get(url));
    const data = response.data as DevtoArticle[];

    const article: DevtoArticle[] = data.map((article) => ({
      id: article.id,
      title: article.title,
      description: article.description,
      url: article.url,
      cover_image: article.cover_image,
      created_at: article.created_at,
      tag_list: article.tag_list,
    }));

    return article;
  }

  async getBodyMarkdown(id: string): Promise<DevtoArticleBodyMarkdown> {
    const url = `${DEV_API_BASE_URL}${ARTICLES_ENDPOINT}/${id}`;
    const response = await firstValueFrom(
      this.httpService.get<DevtoArticleBodyMarkdown>(url),
    );
    const bodyMarkdown = response.data?.body_markdown;

    if (!bodyMarkdown) {
      throw new HttpException('Article body not found', HttpStatus.NOT_FOUND);
    }

    return { id, body_markdown: bodyMarkdown };
  }
}

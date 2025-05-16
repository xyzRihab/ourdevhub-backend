import { Controller, Get } from '@nestjs/common';
import { Article } from '@prisma/client';
import { ApiResponse } from 'src/common/interfaces/response.interface';
import { PublicService } from './public.service';

@Controller('public')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Get('latestDeveloperNews')
  getLatestDeveloperNews(): Promise<ApiResponse<Article[]> | null> {
    return this.publicService.getLatestDeveloperNews();
  }
}

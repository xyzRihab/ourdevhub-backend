import { IsNotEmpty, MaxLength } from 'class-validator';

export class RecommendArticlesDto {
  @IsNotEmpty()
  @MaxLength(8192)
  content: string;
}

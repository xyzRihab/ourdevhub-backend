import {
  IsString,
  IsOptional,
  IsUrl,
  IsArray,
  ArrayMinSize,
} from 'class-validator';

export class CreateArticleDto {
  @IsString()
  title: string;

  @IsString()
  preview: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsUrl()
  url?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  image?: string;

  @IsArray()
  @ArrayMinSize(3, { message: 'You must provide at least 3 tags.' })
  @IsString({ each: true })
  tags: string[];
}

import { IsNotEmpty, IsString } from 'class-validator';
import { IsCuid } from 'src/common/validators/IsCuid';

export class CreateCommentDto {
  @IsNotEmpty()
  @IsString()
  content: string;

  @IsNotEmpty()
  @IsCuid({ message: 'Invalid CUID' })
  userId: string;

  @IsNotEmpty()
  @IsCuid({ message: 'Invalid CUID' })
  articleId: string;

  @IsString({ each: true })
  mentions?: string[];
}

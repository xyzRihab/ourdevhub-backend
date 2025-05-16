import { IsCuid } from 'src/common/validators/IsCuid';

export class CreateBookmarkDto {
  @IsCuid({ message: 'Invalid CUID' })
  userId: string;

  @IsCuid({ message: 'Invalid CUID' })
  articleId: string;
}

import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { IsCuid } from 'src/common/validators/IsCuid';

export class CreateNotificationDto {
  @IsCuid()
  userId: string;

  @IsCuid()
  @IsOptional()
  senderId: string;

  @IsEnum(['like', 'comment', 'Event', 'System'])
  type: string;

  @IsString()
  content: string;

  @IsBoolean()
  isRead: boolean;

  @IsDate()
  createdAt: Date;
}

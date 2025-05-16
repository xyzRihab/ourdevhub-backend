import {
  IsEnum,
  IsOptional,
  IsString,
  IsBoolean,
  IsDateString,
} from 'class-validator';
import { TokenType } from '@prisma/client';

export class CreateTokenDto {
  @IsEnum(TokenType)
  type: TokenType;

  @IsOptional()
  @IsString()
  emailToken?: string;

  @IsBoolean()
  valid: boolean;

  @IsDateString()
  expiration: Date;

  @IsString()
  userId: string;
}

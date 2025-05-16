import {
  IsString,
  IsNotEmpty,
  IsDate,
  IsOptional,
  IsUrl,
  IsPositive,
} from 'class-validator';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsUrl()
  image: string;

  @IsDate()
  @IsNotEmpty()
  eventDate: Date;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsOptional()
  @IsUrl()
  url?: string;

  @IsOptional()
  @IsPositive()
  maxAttendees: number;

  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  tags: string[];
}

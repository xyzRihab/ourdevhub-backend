import { IsNotEmpty, IsString } from 'class-validator';

export class PreferencesTagDto {
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  names: string[];
}

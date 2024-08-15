import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateWebsiteDto {
  @IsNotEmpty()
  websiteName: string;

  @IsNotEmpty()
  indexContent: string;

  @IsOptional()
  errorContent: string;
}

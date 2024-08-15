import { IsNotEmpty } from 'class-validator';

export class CreateWebsiteDto {
  @IsNotEmpty()
  website_name: string;
}

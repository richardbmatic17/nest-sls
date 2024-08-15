import { Injectable, Logger } from '@nestjs/common';
import { CreateWebsiteDto } from './dto/create-website.dto';
import { UpdateWebsiteDto } from './dto/update-website.dto';
import { S3Service } from 'src/services/aws/s3/s3.service';

@Injectable()
export class WebsitesService {
  private readonly logger = new Logger('websiteServiceLogger');

  constructor(private readonly s3Service: S3Service) {}

  async create(createWebsiteDto: CreateWebsiteDto) {
    try {
      const {
        indexContent,
        errorContent,
        websiteName: bucketName,
      } = createWebsiteDto;
      const website = await this.s3Service.createStaticWebsite(
        bucketName,
        indexContent,
        errorContent,
      );

      return `Please visit your Static Website at: ${website}`;
    } catch (error) {
      throw error;
    }
  }

  findAll() {
    return `This action returns all websites`;
  }

  findOne(id: number) {
    return `This action returns a #${id} website`;
  }

  update(id: number, updateWebsiteDto: UpdateWebsiteDto) {
    return `This action updates a #${id} website`;
  }

  remove(id: number) {
    return `This action removes a #${id} website`;
  }
}

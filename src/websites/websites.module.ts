import { Module } from '@nestjs/common';
import { WebsitesService } from './websites.service';
import { WebsitesController } from './websites.controller';
import { S3Module } from 'src/services/aws/s3/s3.module';

@Module({
  imports: [S3Module],
  controllers: [WebsitesController],
  providers: [WebsitesService],
})
export class WebsitesModule {}

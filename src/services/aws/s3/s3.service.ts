import { Injectable, Logger } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  GetObjectCommandOutput,
  CreateBucketCommand,
  PutBucketWebsiteCommand,
  PutBucketPolicyCommand,
  PutPublicAccessBlockCommand,
} from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class S3Service {
  private s3Client: S3Client;
  private readonly logger = new Logger('S3ServiceLogger');

  constructor(private configService: ConfigService) {
    this.s3Client = new S3Client({
      region: this.configService.get<string>('REGION'),
    });
  }

  async getFile(bucket: string, key: string): Promise<GetObjectCommandOutput> {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    try {
      const response = await this.s3Client.send(command);
      return response;
    } catch (error) {
      console.error('Error getting file from S3:', error);
      throw error;
    }
  }

  async deleteFile(bucket: string, key: string) {
    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    try {
      const response = await this.s3Client.send(command);
      return response;
    } catch (error) {
      console.error('Error deleting file from S3:', error);
      throw error;
    }
  }

  async createBucket(bucketName: string): Promise<void> {
    try {
      const createBucketCommand = new CreateBucketCommand({
        Bucket: bucketName,
      });
      const createdBucket = await this.s3Client.send(createBucketCommand);
      this.logger.log(createdBucket);
    } catch (error) {
      this.logger.error({
        name: 'createBucket',
        error,
      });
      if (error.name !== 'BucketAlreadyOwnedByYou') {
        throw error;
      }
    }
  }

  async configureBucketForWebHosting(bucketName: string): Promise<void> {
    try {
      const websiteConfig = {
        Bucket: bucketName,
        WebsiteConfiguration: {
          IndexDocument: {
            Suffix: 'index.html',
          },
          ErrorDocument: {
            Key: 'error.html',
          },
        },
      };

      const putBucketWebsiteCommand = new PutBucketWebsiteCommand(
        websiteConfig,
      );
      const webConfigCreated = await this.s3Client.send(
        putBucketWebsiteCommand,
      );
      this.logger.log(webConfigCreated);
    } catch (error) {
      this.logger.error({
        name: 'configureBucketForWebHosting',
        error,
      });
      throw error;
    }
  }

  async removeBlockPublicAccess(bucketName: string) {
    try {
      const putPublicAccessBlockCommand = new PutPublicAccessBlockCommand({
        Bucket: bucketName,
        PublicAccessBlockConfiguration: {
          BlockPublicAcls: false,
          IgnorePublicAcls: false,
          BlockPublicPolicy: false,
          RestrictPublicBuckets: false,
        },
      });

      await this.s3Client.send(putPublicAccessBlockCommand);
      this.logger.log(
        `Public access block settings removed for bucket ${bucketName}.`,
      );
    } catch (error) {
      this.logger.error({
        name: 'removeBlockPublicAccess',
        error,
      });
      throw error;
    }
  }
  async setPublicReadPolicy(bucketName: string): Promise<void> {
    try {
      const bucketPolicy = {
        Version: '2012-10-17',
        Statement: [
          {
            Sid: 'PublicReadGetObject',
            Effect: 'Allow',
            Principal: '*',
            Action: 's3:GetObject',
            Resource: `arn:aws:s3:::${bucketName}/*`,
          },
        ],
      };

      const putBucketPolicyCommand = new PutBucketPolicyCommand({
        Bucket: bucketName,
        Policy: JSON.stringify(bucketPolicy),
      });

      await this.s3Client.send(putBucketPolicyCommand);
      this.logger.log(`Bucket "${bucketName}" policy set to public read.`);
    } catch (error) {
      this.logger.error({
        name: 'setPublicReadPolicy',
        error,
      });
      throw error;
    }
  }

  async uploadFile(
    bucketName: string,
    key: string,
    body: Buffer | Uint8Array | Blob | string,
  ): Promise<void> {
    try {
      const putObjectCommand = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: body,
        ContentType: 'text/html',
      });
      await this.s3Client.send(putObjectCommand);
      this.logger.log(`File "${key}" uploaded to bucket "${bucketName}".`);
    } catch (error) {
      this.logger.error({
        name: 'uploadFile',
        error,
      });
      throw error;
    }
  }

  async createStaticWebsite(
    bucketName: string,
    indexContent: string,
    errorContent?: string,
  ): Promise<string> {
    try {
      await this.createBucket(bucketName);
      await this.removeBlockPublicAccess(bucketName);
      await this.configureBucketForWebHosting(bucketName);
      await this.setPublicReadPolicy(bucketName);
      await this.uploadFile(bucketName, 'index.html', indexContent);

      if (errorContent) {
        await this.uploadFile(bucketName, 'error.html', errorContent);
      }

      const staticWebUrl = `http://${bucketName}.s3-website-${this.configService.get<string>('REGION')}.amazonaws.com`;

      return staticWebUrl;
    } catch (error) {
      this.logger.error({
        name: 'createStaticWebsite',
        error,
      });
      throw error;
    }
  }
}

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from 'src/schema/auth.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Logger } from '@nestjs/common';
import { S3Service } from 'src/services/aws/s3/s3.service';

@Injectable()
export class UsersService {
  private readonly logger = new Logger('UserService');

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly s3Service: S3Service,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      return await this.userModel.create(createUserDto);
    } catch (error) {
      throw new HttpException('InvalidRequest', HttpStatus.NOT_FOUND);
    }
  }

  async findAll() {
    const bucket = 'test12312321312321';
    const key = 'scqs-automation-51d77ee5fbb3.json';
    const file = await this.s3Service.getFile(bucket, key);
    const file_content = file.Body.transformToString('utf8');
    console.log(file);

    return file_content;
  }

  async findOne(id: number) {
    try {
      console.log(id);
      const user = await this.userModel.findById(id);
      return user;
    } catch (error) {
      throw new HttpException('InvalidRequest', HttpStatus.NOT_FOUND);
    }
  }

  async findByUsername(username: string) {
    try {
      const user = await this.userModel.findOne({ username });
      this.logger.log(user);
      return user;
    } catch (error) {
      throw new HttpException('InvalidRequest', HttpStatus.NOT_FOUND);
    }
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}

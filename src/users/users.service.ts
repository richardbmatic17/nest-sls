import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from 'src/schema/auth.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(createUserDto: CreateUserDto) {
    try {
      return await this.userModel.create(createUserDto);
    } catch (error) {
      throw new HttpException('InvalidRequest', HttpStatus.NOT_FOUND);
    }
  }

  findAll() {
    return `This action returns all users`;
  }

  async findOne(id: number) {
    try {
      const user = await this.userModel.findById(id);
      return user;
    } catch (error) {
      throw new HttpException('InvalidRequest', HttpStatus.NOT_FOUND);
    }
  }

  async findByUsername(username: string) {
    try {
      const user = await this.userModel.findOne({ username });
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

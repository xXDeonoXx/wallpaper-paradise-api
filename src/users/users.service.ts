/* eslint-disable @typescript-eslint/no-var-requires */
import {
  ClassSerializerInterceptor,
  HttpException,
  HttpStatus,
  Injectable,
  UseInterceptors,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getRepository, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

interface FindOneParams {
  id?: string | number;
  email?: string;
  nickname?: string;
}
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (user)
      throw new HttpException('User already exists', HttpStatus.CONFLICT);

    const hashedPassword = await bcrypt.hash(createUserDto.password, 8);
    const newUser = await this.usersRepository.save({
      email: createUserDto.email,
      name: createUserDto.name,
      nickname: createUserDto.nickname,
      password: hashedPassword,
      roles: createUserDto.roles.map((role_id) => {
        return { id: role_id };
      }),
    });
    delete newUser.password;
    return newUser;
  }

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  findOne(params: FindOneParams): Promise<User> {
    return this.usersRepository.findOne({
      where: { ...params },
      relations: ['roles'],
    });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}

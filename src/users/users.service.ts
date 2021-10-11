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
import { Role as RoleEnum } from 'src/enums/role.enum';
import { Role } from 'src/roles/entities/role.entity';

interface FindOneParams {
  id?: string | number;
  email?: string;
  nickname?: string;
}
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Role) private rolesRepository: Repository<Role>
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

  /**
   * erro ao realizar update com entities que possue many to many:
   * I've looked into the code and found out that inserting relational data
   * in many-to-many case is not implemented for repository.update operations, but you can
   * update entities with many-to-many relations via repository.save
   */
  async update(id: number, updateUserDto: UpdateUserDto, currentUser: User) {
    if (
      currentUser.id !== id &&
      currentUser.roles.find((role) => {
        return role.name === RoleEnum.ADMINISTRADOR;
      })
    ) {
      throw new HttpException(
        "You don't have permission to access this resource",
        HttpStatus.UNAUTHORIZED
      );
    }

    if (
      currentUser.roles.find((role) => {
        return role.name === RoleEnum.ADMINISTRADOR;
      }) &&
      !!updateUserDto.roles
    ) {
      throw new HttpException(
        "You can't change roles unless you are an admin",
        HttpStatus.UNAUTHORIZED
      );
    }

    const selectedRoles = updateUserDto.roles
      ? await this.rolesRepository.findByIds(updateUserDto.roles)
      : [];

    const user = await this.usersRepository.findOne({ where: { id: id } });

    const hashedPassword = await bcrypt.hash(updateUserDto.password, 8);
    const newUser = await this.usersRepository.merge(user, {
      ...updateUserDto,
      password: hashedPassword,
      roles: (selectedRoles.length > 0 && selectedRoles) || user.roles,
    });

    return this.usersRepository.save(newUser);
  }

  async remove(id: number, currentUser: User) {
    if (
      currentUser.id !== id &&
      currentUser.roles.find((role) => {
        return role.name === RoleEnum.ADMINISTRADOR;
      })
    ) {
      throw new HttpException(
        "You don't have permission to access this resource",
        HttpStatus.UNAUTHORIZED
      );
    }

    const user = await this.usersRepository.findOne({ where: { id: id } });
    if (!user) throw new HttpException('User not Found', HttpStatus.NOT_FOUND);
    return this.usersRepository.remove(user);
  }
}

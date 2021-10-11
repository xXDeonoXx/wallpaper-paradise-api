/* eslint-disable @typescript-eslint/no-var-requires */
import {
  ClassSerializerInterceptor,
  HttpException,
  HttpStatus,
  Injectable,
  UseInterceptors,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createQueryBuilder, getRepository, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { Role as RoleEnum } from 'src/enums/role.enum';
import { Role } from 'src/roles/entities/role.entity';
import { FindUserParams } from './dto/find-user-dto';
import { Page } from 'src/shared/Page';

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

  async findPage(pageable: FindUserParams): Promise<Page<User>> {
    const {
      size = 10,
      page: pageNumber = 1,
      name,
      email,
      nickname,
      role,
    } = pageable;
    const query = createQueryBuilder(User, 'user');

    query.leftJoinAndSelect('user.roles', 'role');

    if (role) {
      query.andWhere('role.id = :id', {
        id: role,
      });
    }

    if (name) {
      query.andWhere('lower(user.name) like :name', {
        name: `%${name
          .toLowerCase()
          .trim()
          .replace(/[^\w\s]/gi, '')}%`,
      });
    }

    if (email) {
      query.andWhere('lower(user.email) like :email', {
        email: `%${email.toLocaleLowerCase()}%`,
      });
    }

    if (nickname) {
      query.andWhere('lower(user.nickname) like :nickname', {
        nickname: `%${nickname.toLocaleLowerCase()}%`,
      });
    }

    query.orderBy('user.id', 'DESC');

    query.take(Number(size));

    if (pageNumber === 1) {
      query.skip(Number(pageNumber) - 1);
    } else {
      const pageNumberMinusone = Number(pageNumber) - 1;
      query.skip(Number(size) * Number(pageNumberMinusone));
    }

    const [users, count] = await query.getManyAndCount();

    const page = new Page(users, count, pageNumber, size);

    return page;
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

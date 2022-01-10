import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { response } from 'express';
import { User } from 'src/users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersService.findOne({ email });
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);

    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      return user;
    } else {
      throw new HttpException(
        'Wrong credentials provided',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async login({ email, name, nickname, id, roles }: User) {
    const payload = { nickname, id, roles };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        email,
        name,
        nickname,
        roles,
      },
    };
  }
}

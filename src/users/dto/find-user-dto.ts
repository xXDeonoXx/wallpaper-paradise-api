import { IsEmail, IsNotEmpty } from 'class-validator';
import Paginator from 'src/shared/Paginator';
import { User } from '../entities/user.entity';

export class FindUserParams extends Paginator {
  name?: string;

  email?: string;

  nickname?: string;

  role?: number;
}

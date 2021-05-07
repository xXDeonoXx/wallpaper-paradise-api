import { UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { Exclude } from 'class-transformer';
import { User } from 'src/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';

@UseInterceptors(ClassSerializerInterceptor)
@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;
}

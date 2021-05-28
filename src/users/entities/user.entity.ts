import { ClassSerializerInterceptor, UseInterceptors } from '@nestjs/common';
import { Exclude } from 'class-transformer';
import { Image } from 'src/images/entities/image.entity';
import { Role } from 'src/roles/entities/role.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@UseInterceptors(ClassSerializerInterceptor)
@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column()
  nickname: string;

  @OneToMany(() => Image, (image) => image.uploader)
  images: Image[];

  @ManyToMany((type) => Role)
  @JoinTable({
    name: 'user_roles',
    joinColumn: {
      name: 'user_id',
    },
    inverseJoinColumn: {
      name: 'role_id',
    },
  })
  roles: Role[];
}

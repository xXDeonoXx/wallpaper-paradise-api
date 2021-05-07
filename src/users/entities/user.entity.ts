import { ClassSerializerInterceptor, UseInterceptors } from '@nestjs/common';
import { Exclude } from 'class-transformer';
import { Image } from 'src/images/entities/image.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

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

  @OneToMany((type) => Image, (image) => image.uploader)
  images: Image[];
}

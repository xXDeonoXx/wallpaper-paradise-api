import { UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { Exclude } from 'class-transformer';
import { Category } from 'src/categories/entities/category.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';

@UseInterceptors(ClassSerializerInterceptor)
@Entity('images')
export class Image {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  url: string;

  @ManyToOne((type) => User, (user) => user.images, { cascade: true })
  @JoinColumn({ name: 'uploader_id' })
  uploader: User;

  @ManyToMany((type) => Category, { onDelete: 'CASCADE' })
  @JoinTable({
    name: 'image_categories',
    joinColumn: { name: 'image_id' },
    inverseJoinColumn: { name: 'category_id' },
  })
  categories: Category[];
}

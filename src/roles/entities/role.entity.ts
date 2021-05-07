import { UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@UseInterceptors(ClassSerializerInterceptor)
@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  initials: string;
}

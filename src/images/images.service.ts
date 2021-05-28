import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateImageDto } from './dto/create-image.dto';
import { UpdateImageDto } from './dto/update-image.dto';
import { Image } from './entities/image.entity';

@Injectable()
export class ImagesService {
  constructor(
    @InjectRepository(Image)
    private imageRepository: Repository<Image>,
    @InjectRepository(User) private userRepositoty: Repository<User>
  ) {}
  async create(createImageDto: CreateImageDto, sessionUser: User) {
    const user = await this.userRepositoty.findOne({
      where: { id: sessionUser.id },
    });
    if (!user)
      throw new HttpException('User already exists', HttpStatus.NOT_FOUND);

    const { title, url, categories } = createImageDto;
    // É PRECISO VALIDAR AS CATEGORIES ANTES DE TENTAR CRIAR
    console.log(
      categories.map((category_id) => {
        return { id: category_id };
      })
    );
    const newImage = await this.imageRepository.save({
      title: title,
      uploader: user,
      url: url,
      categories: categories.map((category_id) => {
        return { id: category_id };
      }),
    });
    return newImage;
  }

  findAll() {
    return `This action returns all images`;
  }

  findOne(id: number) {
    return `This action returns a #${id} image`;
  }

  update(id: number, updateImageDto: UpdateImageDto) {
    return `This action updates a #${id} image`;
  }

  remove(id: number) {
    return `This action removes a #${id} image`;
  }
}

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from 'src/categories/entities/category.entity';
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
    @InjectRepository(User) private userRepositoty: Repository<User>,
    @InjectRepository(Category) private categoryRepository: Repository<Category>
  ) {}
  async create(
    createImageDto: CreateImageDto,
    sessionUser: User,
    image: Express.Multer.File
  ) {
    const user = await this.userRepositoty.findOne({
      where: { id: sessionUser.id },
    });
    if (!user)
      throw new HttpException('User already exists', HttpStatus.NOT_FOUND);

    const { title, categories } = createImageDto;
    const selectedCategories = await this.categoryRepository.findByIds(
      categories
    );
    if (selectedCategories.length < 1)
      throw new HttpException(
        'Any of your selected categories exists',
        HttpStatus.NOT_FOUND
      );

    const newImage = await this.imageRepository.save({
      title: title,
      uploader: user,
      categories: selectedCategories,
    });
    return newImage;
  }

  findAll() {
    return this.imageRepository.find();
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

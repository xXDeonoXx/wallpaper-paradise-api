import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { S3 } from 'aws-sdk';
import { Category } from 'src/categories/entities/category.entity';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { CreateImageDto } from './dto/create-image.dto';
import { UpdateImageDto } from './dto/update-image.dto';
import { Image } from './entities/image.entity';

@Injectable()
export class ImagesService {
  private client: S3;

  constructor(
    @InjectRepository(Image)
    private imageRepository: Repository<Image>,
    @InjectRepository(User) private userRepositoty: Repository<User>,
    @InjectRepository(Category) private categoryRepository: Repository<Category>
  ) {
    this.client = new S3({
      region: process.env.AWS_BUCKET_REGION,
    });
  }

  async uploadToS3(file: Express.Multer.File): Promise<string> {
    if (file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/png')
      throw new HttpException(
        'Invalid file, only png and jpeg are allowed',
        HttpStatus.BAD_REQUEST
      );

    const generatedName = `${uuidv4()}-${file.originalname}`;

    await this.client
      .putObject({
        Bucket: `${process.env.AWS_BUCKET}/${'images'}`,
        Key: generatedName,
        ACL: 'public-read',
        Body: file.buffer,
        ContentType: 'image/png',
      })
      .promise();

    return `https://wallpaper-paradise.s3-sa-east-1.amazonaws.com/images/${generatedName}`;
  }

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
      categories.split(',')
    );
    if (selectedCategories.length < 1) {
      throw new HttpException(
        'Any of your selected categories exists',
        HttpStatus.NOT_FOUND
      );
    }

    const uploadedFile = await this.uploadToS3(image);

    const newImage = await this.imageRepository.save({
      title: title,
      uploader: user,
      categories: selectedCategories,
      url: uploadedFile,
    });
    return newImage;
  }

  findAll() {
    return this.imageRepository.find({ relations: ['categories', 'uploader'] });
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

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { S3 } from 'aws-sdk';
import { Category } from 'src/categories/entities/category.entity';
import { Page } from 'src/shared/Page';
import { User } from 'src/users/entities/user.entity';
import { createQueryBuilder, Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { CreateImageDto } from './dto/create-image.dto';
import { FindImageParams } from './dto/find-image.dto';
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

  async findPage(pageable: FindImageParams): Promise<Page<Image>> {
    const {
      size = 10,
      page: pageNumber = 1,
      title,
      uploader_id,
      categories,
    } = pageable;
    const query = createQueryBuilder(Image, 'image');

    query.leftJoinAndSelect('image.categories', 'category');

    if (title) {
      query.andWhere('lower(image.title) like :title', {
        title: `%${title
          .toLowerCase()
          .trim()
          .replace(/[^\w\s]/gi, '')}%`,
      });
    }

    if (uploader_id) {
      query.and;
    }

    query.orderBy('image.id', 'DESC');

    query.take(Number(size));
    if (pageNumber === 1) {
      query.skip(Number(pageNumber) - 1);
    } else {
      const pageNumberMinusone = Number(pageNumber) - 1;
      query.skip(Number(size) * Number(pageNumberMinusone));
    }

    const [images, count] = await query.getManyAndCount();

    return new Page(images, count, pageNumber, size);
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

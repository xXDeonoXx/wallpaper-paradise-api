import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { S3 } from 'aws-sdk';
import { Category } from 'src/categories/entities/category.entity';
import { Role as RoleEnum, Role as RolesEnum } from 'src/enums/role.enum';
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

    const generatedName = `${uuidv4()}-${file.originalname.replace(' ', '_')}`;

    await this.client
      .putObject({
        Bucket: `${process.env.AWS_BUCKET}/${'images'}`,
        Key: generatedName,
        ACL: 'public-read',
        Body: file.buffer,
        ContentType: file.mimetype,
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
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    if (!image)
      throw new HttpException(
        'Request body dont contain a file',
        HttpStatus.BAD_REQUEST
      );

    const { title, categories } = createImageDto;
    if (categories.length < 1) {
      throw new HttpException(
        'Any of your selected categories exists',
        HttpStatus.NOT_FOUND
      );
    }

    const uploadedFile = await this.uploadToS3(image);

    const newImage = await this.imageRepository.save({
      title: title,
      uploader: user,
      categories: categories.map((c) => {
        return { id: c };
      }),
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
    query.leftJoinAndSelect('image.uploader', 'uploader');

    if (title) {
      query.andWhere('lower(image.title) like :title', {
        title: `%${title
          .toLowerCase()
          .trim()
          .replace(/[^\w\s]/gi, '')}%`,
      });
    }

    if (uploader_id) {
      query.andWhere('lower(image.uploader_id) = :uploader_id', {
        uploader_id,
      });
    }

    if (categories) {
      const inString = [];
      categories.forEach((category_id, index) => {
        index === categories.length
          ? inString.push(`${category_id}'` + ', ')
          : inString.push(`${category_id}'`);
      });
      query.andWhere(`category.id IN (:inString)`, { inString });
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

  async findOne(id: number) {
    const image = await this.imageRepository.findOne(id, {
      relations: ['categories', 'uploader'],
    });
    if (image) return image;

    throw new HttpException('Image not Found', HttpStatus.NOT_FOUND);
  }

  async update(id: number, updateImageDto: UpdateImageDto, currentUser: User) {
    if (
      currentUser.id !== id &&
      currentUser.roles.find((role) => {
        return role.name === RolesEnum.ADMINISTRADOR;
      })
    ) {
      throw new HttpException(
        "You don't have permission to access this resource",
        HttpStatus.UNAUTHORIZED
      );
    }

    const image = await this.imageRepository.findOne({
      where: { id },
      relations: ['categories'],
    });

    if (!image)
      throw new HttpException('Image not found', HttpStatus.NOT_FOUND);

    const categoriesChosen = updateImageDto.categories
      ? await this.categoryRepository.findByIds(updateImageDto.categories)
      : [];

    if (categoriesChosen.length < updateImageDto.categories?.length)
      throw new HttpException(
        `one or more of the provided categories doesn't exist`,
        HttpStatus.NOT_FOUND
      );

    return this.imageRepository.save({
      ...image,
      ...updateImageDto,
      categories:
        (categoriesChosen?.length > 0 && [...categoriesChosen]) ||
        image.categories,
    });
  }

  async remove(id: number, currentUser: User) {
    const image = await this.imageRepository.findOne({
      where: { id },
      relations: ['categories', 'uploader'],
    });
    if (!image)
      throw new HttpException('Image not found', HttpStatus.NOT_FOUND);

    if (
      image.uploader.id != currentUser.id &&
      !currentUser.roles.find((role) => {
        return role.name === RoleEnum.ADMINISTRADOR;
      })
    ) {
      throw new HttpException(
        "You don't have permission to access this resource",
        HttpStatus.UNAUTHORIZED
      );
    }
    return this.imageRepository.remove(image);
  }
}

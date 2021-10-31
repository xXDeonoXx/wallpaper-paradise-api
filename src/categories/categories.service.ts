import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Page } from 'src/shared/Page';
import { createQueryBuilder, Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { FindCategoryParams } from './dto/find-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const { name } = createCategoryDto;

    const category = await this.categoryRepository.findOne({ where: { name } });

    if (category)
      throw new HttpException(
        'This category already exists',
        HttpStatus.FORBIDDEN
      );

    return await this.categoryRepository.save({ name });
  }

  async findPage(pageable: FindCategoryParams): Promise<Page<Category>> {
    const { size = 10, page: pageNumber = 1, name } = pageable;
    const query = createQueryBuilder(Category, 'category');

    if (name) {
      query.andWhere('lower(category.name) like :name', {
        name: `%${name
          .toLowerCase()
          .trim()
          .replace(/[^\w\s]/gi, '')}%`,
      });
    }

    query.take(Number(size));
    if (pageNumber === 1) {
      query.skip(Number(pageNumber) - 1);
    } else {
      const pageNumberMinusone = Number(pageNumber) - 1;
      query.skip(Number(size) * Number(pageNumberMinusone));
    }
    const [categories, count] = await query.getManyAndCount();
    return new Page(categories, count, pageNumber, size);
  }

  async findOne(id: number) {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category)
      throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
    return category;
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category)
      throw new HttpException('Category not found', HttpStatus.NOT_FOUND);

    return this.categoryRepository.save({ ...category, ...updateCategoryDto });
  }

  async remove(id: number) {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category)
      throw new HttpException('Category not found', HttpStatus.NOT_FOUND);

    return await this.categoryRepository.remove(category);
  }
}

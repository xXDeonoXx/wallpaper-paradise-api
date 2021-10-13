import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { RolesGuard } from 'src/roles/roles.guard';
import { Page } from 'src/shared/Page';
import { Public } from 'src/utils/Public';
import { CurrentUser } from 'src/utils/user.decorator';
import { CreateImageDto } from './dto/create-image.dto';
import { FindImageParams } from './dto/find-image.dto';
import { UpdateImageDto } from './dto/update-image.dto';
import { Image } from './entities/image.entity';
import { ImagesService } from './images.service';

@Controller('images')
@UseInterceptors(ClassSerializerInterceptor)
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  create(
    @Body() createImageDto: CreateImageDto,
    @CurrentUser() user,
    @UploadedFile() file: Express.Multer.File
  ) {
    return this.imagesService.create(createImageDto, user, file);
  }

  @Get()
  @Public()
  findPage(@Query() imageParams: FindImageParams): Promise<Page<Image>> {
    return this.imagesService.findPage(imageParams);
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.imagesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateImageDto: UpdateImageDto) {
    return this.imagesService.update(+id, updateImageDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.imagesService.remove(+id);
  }
}

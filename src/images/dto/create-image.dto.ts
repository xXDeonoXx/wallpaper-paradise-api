import { IsNotEmpty, IsEmail } from 'class-validator';
import { User } from 'src/users/entities/user.entity';

export class CreateImageDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  url: string;

  // picks the @CurrentUser and set him as the uploader
  //   @IsNotEmpty()
  //   uploader: number;

  @IsNotEmpty({
    message: 'Informe ao menos uma categoria',
  })
  categories: number[];
}

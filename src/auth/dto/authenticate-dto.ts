import { IsEmail, IsNotEmpty } from 'class-validator';

export class AuthenticateDto {
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  password: string;
}

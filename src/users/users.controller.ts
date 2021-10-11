import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ClassSerializerInterceptor,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/roles/roles.decorator';
import { Role } from 'src/enums/role.enum';
import { RolesGuard } from 'src/roles/roles.guard';
import { Public } from 'src/utils/Public';
import { CurrentUser } from 'src/utils/user.decorator';
import { User } from './entities/user.entity';

@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles(Role.REGULAR)
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.usersService.findOne({ id });
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: User
  ) {
    return this.usersService.update(+id, updateUserDto, currentUser);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() currentUser) {
    return this.usersService.remove(+id, currentUser);
  }
}

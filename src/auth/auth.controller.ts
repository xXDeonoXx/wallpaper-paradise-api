import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Role } from 'src/enums/role.enum';
import { Roles } from 'src/roles/roles.decorator';
import { User } from 'src/users/entities/user.entity';
import { Public } from 'src/utils/Public';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';

@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(private authService: AuthService) {}
  @Get('')
  async testnoRole() {
    return 'Alive, no roles';
  }

  @Get('/admin')
  @Roles(Role.ADMINISTRADOR)
  async testAdmin() {
    return 'Admin only';
  }

  @Get('/regular')
  @Roles(Role.REGULAR)
  async testRegular() {
    return 'Regular only';
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('/login')
  async authenticate(@Req() req): Promise<any> {
    return this.authService.login(req.user);
  }
}

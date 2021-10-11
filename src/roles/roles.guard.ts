import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from 'src/enums/role.enum';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    if (
      requiredRoles.some(
        (roleToHave) =>
          !!user.roles?.find(
            (role) =>
              role.name === roleToHave || role.name === Role.ADMINISTRADOR
          )
      )
    ) {
      return true;
    }

    throw new HttpException('InsufFicient privileges', HttpStatus.FORBIDDEN);
  }
}

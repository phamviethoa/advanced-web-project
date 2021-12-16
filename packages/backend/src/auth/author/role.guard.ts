import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { StudentToClass } from 'src/student-to-class/student-to-class.entity';
import { Role } from './entities/role.enum';
import { ROLES_KEY } from './role.decorator';

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

    const request = context.switchToHttp().getRequest();
    //const user = request.user;
    console.log(request.user);

    const user ={
      roles:'teacher',
    };

    return requiredRoles.some((role) => user.roles?.includes(role));
  }
}
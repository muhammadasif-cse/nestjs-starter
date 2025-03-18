import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const role = this.reflector.getAllAndOverride<(number | string)[]>('role', [
      context.getClass(),
      context.getHandler(),
    ]);
    if (!role.length) {
      return true;
    }
    const request = context.switchToHttp().getRequest();

    return role.map(String).includes(String(request.user?.role?.id));
  }
}

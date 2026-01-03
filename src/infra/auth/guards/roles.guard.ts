import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Pessoa } from 'src/modules/pessoas/types/pessoa';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) {
      return true;
    }
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as Pessoa;
    return this._matchRoles(roles, user);
  }

  private _matchRoles(roles: string[], user: Pessoa) {
    if (!user) {
      return false;
    }
    for (const role of roles) {
      const attr = this._capitalizar(role);
      if (
        user &&
        typeof user === 'object' &&
        attr in user &&
        user.permissao[attr] === true
      ) {
        return true;
      }
    }
    return false;
  }

  private _capitalizar(campo: string): string {
    const arr = campo.split('-');
    const nome = [arr[0]];
    for (let i = 1; i < arr.length; i++) {
      const parte = arr[i].charAt(0).toUpperCase() + arr[i].slice(1);
      nome.push(parte);
    }
    return nome.join('');
  }
}

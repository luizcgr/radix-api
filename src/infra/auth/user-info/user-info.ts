import { Injectable } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import type { Pessoa } from 'src/modules/pessoas/types/pessoa';

@Injectable()
export class UserInfo {
  constructor(private readonly _cls: ClsService) {}

  init(pessoa: Pessoa): void {
    const obj = Object.freeze(pessoa);
    this._cls.set('userInfo', obj);
  }

  get userInfo(): Pessoa | undefined {
    return this._cls.get<Pessoa>('userInfo');
  }
}

import { Injectable } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import type { Pessoa } from 'src/modules/pessoas/types/pessoa';

type UserInfoRepo = {
  pessoa: Pessoa;
  accessToken: string;
};

@Injectable()
export class UserInfo {
  constructor(private readonly _cls: ClsService) {}

  init(pessoa: Pessoa, accessToken: string): void {
    const repo: UserInfoRepo = Object.freeze({ pessoa, accessToken });
    this._cls.set('userInfo', repo);
  }

  private get _repo() {
    return this._cls.get<UserInfoRepo>('userInfo');
  }

  get pessoa(): Pessoa | undefined {
    return this._repo?.pessoa;
  }

  get accessToken(): string | undefined {
    return this._repo?.accessToken;
  }
}

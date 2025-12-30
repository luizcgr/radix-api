import { Injectable } from '@nestjs/common';
import type { Pessoa } from 'src/modules/pessoas/types/pessoa';

export interface UserInfoProps {
  data: Date;
  pessoa: Pessoa;
}

@Injectable()
export class UserInfo {
  private _userInfo?: UserInfoProps;

  constructor() {}

  init(userInfo: UserInfoProps): void {
    this._userInfo = Object.freeze(userInfo);
  }

  get userInfo(): UserInfoProps | undefined {
    return this._userInfo;
  }
}

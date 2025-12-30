import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PESSOA_REPOSITORY } from 'src/constants';
import { CelulaModel } from '../../database/models/celula.model';
import { PessoaModel } from '../../database/models/pessoa.model';
import { Environment } from '../../environment/environment.service';
import { UserInfo } from '../user-info/user-info';
import { SetorModel } from 'src/infra/database/models/setor.model';
import { MissaoModel } from 'src/infra/database/models/missao.model';

export interface JwtPayload {
  uid: number;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly env: Environment,
    @Inject(PESSOA_REPOSITORY)
    private readonly _pessoaModel: typeof PessoaModel,
    private readonly _userInfo: UserInfo,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: env.jwt.secret,
    });
  }

  async validate(payload: JwtPayload) {
    const pessoaId = Number(payload.uid);
    if (pessoaId) {
      const pessoa = await this._pessoaModel.findByPk(pessoaId, {
        include: [
          {
            model: CelulaModel,
            include: [{ model: SetorModel, include: [MissaoModel] }],
          },
        ],
      });

      if (pessoa) {
        this._userInfo.init(pessoa);
        return pessoa;
      }
    }
    throw new UnauthorizedException();
  }
}

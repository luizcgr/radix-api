import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PESSOA_REPOSITORY } from 'src/constants';
import { PessoaModel } from '../../database/models/pessoa.model';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Environment } from '../../environment/environment.service';
import { CelulaModel } from '../../database/models/celula.model';
import { PermissaoModel } from '../../database/models/permissao.model';
import { SetorModel } from '../../database/models/setor.model';
import { MissaoModel } from '../../database/models/missao.model';
import { UserInfo } from '../user-info/user-info';

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
          { as: 'permissao', model: PermissaoModel },
          {
            as: 'celula',
            model: CelulaModel,
            include: [
              {
                as: 'setor',
                model: SetorModel,
                include: [{ as: 'missao', model: MissaoModel }],
              },
            ],
          },
        ],
      });

      if (pessoa) {
        this._userInfo.init({ data: new Date(), pessoa });
        return pessoa.toJSON();
      }
    }
    throw new UnauthorizedException();
  }
}

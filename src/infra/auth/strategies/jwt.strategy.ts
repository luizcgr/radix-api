import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PESSOA_REPOSITORY } from 'src/constants';
import { PermissaoModel } from 'src/infra/database/models/permissao.model';
import { PessoaModel } from '../../database/models/pessoa.model';
import { Environment } from '../../environment/environment.service';
import { UserInfo } from '../user-info/user-info';
import { PessoaAdapter } from 'src/infra/database/adapters/pessoa.adapter';
import { CelulaModel } from 'src/infra/database/models/celula.model';
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
    private readonly _pessoaAdapter: PessoaAdapter,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: env.jwt.secret,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload) {
    const pessoaId = Number(payload.uid);
    if (pessoaId) {
      const pessoaModel = await this._pessoaModel.findByPk(pessoaId, {
        include: [
          { model: PermissaoModel, as: 'permissao' },
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

      const accessToken = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
      if (pessoaModel && accessToken) {
        const pessoa = this._pessoaAdapter.adapt(pessoaModel)!;
        this._userInfo.init(pessoa, accessToken);
        return pessoa;
      }
    }
    throw new UnauthorizedException();
  }
}

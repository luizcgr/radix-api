import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as jwt from 'jsonwebtoken';
import moment from 'moment';
import ms, { StringValue } from 'ms';
import { PessoaModel } from 'src/infra/database/models/pessoa.model';
import { Environment } from 'src/infra/environment/environment.service';
import { JwtContent } from '../types/jwt-content';
import { JwtToken } from '../types/jwt-token';
import { PermissaoModel } from 'src/infra/database/models/permissao.model';

@Injectable()
export class GeradorJwtTokenService {
  constructor(
    private _jwtService: JwtService,
    private readonly _env: Environment,
  ) {}

  gerar(pessoa: PessoaModel): JwtToken {
    const accessToken = this._assinarJwtToken(pessoa);
    const refreshToken = this._assinarJwtRefreshToken(pessoa);
    const token: JwtToken = {
      accessToken,
      refreshToken,
      email: pessoa.email,
      name: pessoa.nome,
      refreshExpiresIn: this._calcularDataExpiracao(
        this._env.jwt.refreshExpiresIn,
      ),
      expiresIn: this._calcularDataExpiracao(this._env.jwt.expiresIn),
      roles: _montarRoles(pessoa.permissao),
    };
    return token;
  }

  private _calcularDataExpiracao(timeout: string): Date {
    const expirationTimeout = ms(timeout as StringValue);
    const expirationDate = moment().add(expirationTimeout, 'milliseconds');
    return expirationDate.toDate();
  }

  private _assinarJwtToken(usuario: PessoaModel): string {
    const payload = this._geraraPayloadAssinaturaJwt(usuario);
    return this._jwtService.sign(
      { ...payload },
      { expiresIn: this._env.jwt.expiresIn as StringValue },
    );
  }

  private _assinarJwtRefreshToken(usuario: PessoaModel): string {
    const payload = this._geraraPayloadAssinaturaJwt(usuario);
    return jwt.sign({ ...payload }, this._env.jwt.secret, {
      expiresIn: this._env.jwt.refreshExpiresIn as StringValue,
    });
  }

  private _geraraPayloadAssinaturaJwt(usuario: PessoaModel): JwtContent {
    return new JwtContent(usuario.id, new Date().getTime());
  }
}
function _montarRoles(permissao: PermissaoModel): string[] {
  const roleMappings: Record<string, () => boolean> = {
    missao: () => permissao.missao,
    setor: () => permissao.setor,
    celula: () => permissao.celula,
  };
  return Object.keys(roleMappings).filter((role) => roleMappings[role]());
}

import { Inject, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { concatMap, defer, iif, Observable, of, throwError } from 'rxjs';
import { PESSOA_REPOSITORY } from 'src/constants';
import { PermissaoModel } from 'src/infra/database/models/permissao.model';
import { PessoaModel } from 'src/infra/database/models/pessoa.model';
import { CustomError } from 'src/utils/custom-error';
import { JwtToken } from '../types/jwt-token';
import { RefreshToken } from '../types/refresh-token';
import { GeradorJwtTokenService } from './gerador-jwt-token.service';

@Injectable()
export class RefreshTokenService {
  private readonly _logger = new Logger(RefreshTokenService.name);

  constructor(
    private readonly jwtService: JwtService,
    @Inject(PESSOA_REPOSITORY)
    private readonly _pessoaRepository: typeof PessoaModel,
    private readonly _geradorTokenJwtService: GeradorJwtTokenService,
  ) {}

  refresh(refresh: RefreshToken): Observable<JwtToken> {
    try {
      this.jwtService.verify(refresh.refreshToken);
      const payload = this.jwtService.decode<{ uid: string }>(
        refresh.refreshToken,
      );
      const pessoaId = +payload.uid;
      return defer(() =>
        this._pessoaRepository.findByPk(pessoaId, {
          include: [{ as: 'permissao', model: PermissaoModel }],
        }),
      ).pipe(
        concatMap((pessoaModel) => {
          const existe$ = defer(() =>
            of(this._geradorTokenJwtService.gerar(pessoaModel!)),
          );
          const naoExiste$ = throwError(
            () => new CustomError('Pessoa não encontrada', 400),
          );
          return iif(() => pessoaModel != null, existe$, naoExiste$);
        }),
      );
    } catch (error) {
      this._logger.debug('Token inválido ao tentar refresh token: ' + error);
      return throwError(() => new CustomError('Token inválido', 401));
    }
  }
}

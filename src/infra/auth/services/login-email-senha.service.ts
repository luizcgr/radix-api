import { Inject, Injectable } from '@nestjs/common';
import { concatMap, defer, iif, Observable, of, throwError } from 'rxjs';
import { PESSOA_REPOSITORY } from 'src/constants';
import { PessoaModel } from 'src/infra/database/models/pessoa.model';
import { CustomError } from 'src/utils/custom-error';
import { HashSenha } from '../classes/hash-senha';
import { Credenciais } from '../types/credenciais';
import { JwtToken } from '../types/jwt-token';
import { GeradorJwtTokenService } from './gerador-jwt-token.service';

@Injectable()
export class LoginEmailSenhaService {
  constructor(
    @Inject(PESSOA_REPOSITORY)
    private readonly _pessoaRepository: typeof PessoaModel,
    private readonly _geradorJwtTokenService: GeradorJwtTokenService,
  ) {}

  validar({ email, senha }: Credenciais): Observable<JwtToken> {
    return defer(() =>
      this._pessoaRepository.findOne({ where: { email } }),
    ).pipe(
      concatMap((pessoa) => {
        const existe$ = defer(() => of(pessoa!));
        const naoExiste$ = this._throwCredenciaisInvalidas();
        return iif(() => !!pessoa, existe$, naoExiste$);
      }),
      concatMap((pessoa) => {
        const senhaValida$ = defer(() => {
          const token: JwtToken = this._geradorJwtTokenService.gerar(pessoa);
          return of(token);
        });
        const senhaInvalida$ = this._throwCredenciaisInvalidas();
        return iif(
          () => HashSenha.comparar(senha, pessoa.senha),
          senhaValida$,
          senhaInvalida$,
        );
      }),
    );
  }

  private _throwCredenciaisInvalidas() {
    return throwError(() => new CustomError('Credenciais inválidas', 401));
  }
}

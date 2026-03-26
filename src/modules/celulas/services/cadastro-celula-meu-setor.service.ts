import { BadRequestException, Injectable } from '@nestjs/common';
import {
  concatMap,
  defer,
  iif,
  Observable,
  of,
  OperatorFunction,
  throwError,
} from 'rxjs';
import { UserInfo } from 'src/infra/auth/user-info/user-info';
import { CadastroCelulaMeuSetor } from '../types/cadastro-celula-meu-setor';
import { Celula } from '../types/celula';
import { CadastroCelulaService } from './cadastro-celula.service';
import { ConsultaCelulasService } from './consulta-celulas.service';

@Injectable()
export class CadastroCelulaMeuSetorService {
  constructor(
    private readonly _userInfo: UserInfo,
    private readonly _consultaCelulasService: ConsultaCelulasService,
    private readonly _cadastroCelulaService: CadastroCelulaService,
  ) {}

  salvar(cadastro: CadastroCelulaMeuSetor): Observable<Celula> {
    const inclusao$ = this._incluirCelula(cadastro);
    const alteracao$ = this._validarAcessoAlteracaoCelulaSetor(cadastro);
    return iif(() => !!cadastro.id, alteracao$, inclusao$);
  }

  private _incluirCelula(cadastro: CadastroCelulaMeuSetor) {
    return this._cadastroCelulaService.salvar({
      ...cadastro,
      setorId: this._userInfo.pessoa!.celula.setor.id,
    });
  }

  private _validarAcessoAlteracaoCelulaSetor(cadastro: CadastroCelulaMeuSetor) {
    return this._consultaCelulasService
      .consultar({
        id: cadastro.id,
        setorId: this._userInfo.pessoa!.celula.setor.id,
      })
      .pipe(
        this._verificarCelulaExiste(),
        this._validarAcessoParaAlteracao(cadastro),
        this._alterarCelua(),
      );
  }

  private _validarAcessoParaAlteracao(
    cadastro: CadastroCelulaMeuSetor,
  ): OperatorFunction<Celula, CadastroCelulaMeuSetor> {
    return concatMap((celula) => {
      const possuiAcesso$ = of(cadastro);
      const naoPossuiAcesso$ = throwError(
        () =>
          new BadRequestException(
            'A célula informada não pertence ao seu setor',
          ),
      );
      return iif(
        () => celula.setor.id === this._userInfo.pessoa!.celula.setor.id,
        possuiAcesso$,
        naoPossuiAcesso$,
      );
    });
  }

  private _alterarCelua(): OperatorFunction<CadastroCelulaMeuSetor, Celula> {
    return concatMap((cadastroValido) =>
      this._cadastroCelulaService.salvar({
        ...cadastroValido,
        setorId: this._userInfo.pessoa!.celula.setor.id,
      }),
    );
  }

  private _verificarCelulaExiste(): OperatorFunction<Celula[], Celula> {
    return concatMap((celulas) => {
      const existe$ = defer(() => of(celulas[0]));
      const naoExiste$ = throwError(
        () => new BadRequestException('Célula não encontrada'),
      );
      return iif(() => celulas.length > 0, existe$, naoExiste$);
    });
  }
}

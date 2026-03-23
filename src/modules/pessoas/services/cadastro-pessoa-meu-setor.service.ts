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
import { ConsultaCelulasService } from 'src/modules/celulas/services/consulta-celulas.service';
import { Celula } from 'src/modules/celulas/types/celula';
import { CadastroPessoaMeuSetor } from '../types/cadastro-pessoa-meu-setor';
import { Pessoa } from '../types/pessoa';
import { CadastroPessoasService } from './cadastro-pessoas.service';

@Injectable()
export class CadastroPessoaMeuSetorService {
  constructor(
    private readonly _userInfo: UserInfo,
    private readonly _cadastroPessoaService: CadastroPessoasService,
    private readonly _consultaCelulaService: ConsultaCelulasService,
  ) {}

  salvar(cadastro: CadastroPessoaMeuSetor): Observable<Pessoa> {
    return this._consultaCelulaService
      .consultarPeloId(cadastro.celulaId)
      .pipe(
        this._verificarCelula(),
        this._verificarPermissao(),
        this._salvarCelula(cadastro),
      );
  }

  private _salvarCelula(
    cadastro: CadastroPessoaMeuSetor,
  ): OperatorFunction<Celula, Pessoa> {
    return concatMap(() =>
      this._cadastroPessoaService.salvar({
        ...cadastro,
        permissoes: {
          setor: cadastro.permissoes.setor,
          celula: cadastro.permissoes.celula,
          admin: false,
          missao: false,
        },
      }),
    );
  }

  private _verificarPermissao(): OperatorFunction<Celula, Celula> {
    return concatMap((celula) => {
      const mesmoSetor$ = of(celula);
      const setorDiferente$ = throwError(
        () =>
          new BadRequestException(
            'Só é permitido alterar células do seu setor',
          ),
      );
      const mesmoSetor =
        celula.setor.id === this._userInfo.pessoa!.celula.setor.id;
      return iif(() => mesmoSetor, mesmoSetor$, setorDiferente$);
    });
  }

  private _verificarCelula(): OperatorFunction<Celula | null, Celula> {
    return concatMap((celula) => {
      const existe$ = defer(() => of(celula!));
      const naoExiste$ = throwError(
        () => new Error('Célula informada não existe'),
      );
      return iif(() => !!celula, existe$, naoExiste$);
    });
  }
}

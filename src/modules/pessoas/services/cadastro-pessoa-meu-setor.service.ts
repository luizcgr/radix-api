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
import { ConsultaPessoasService } from './consulta-pessoas.service';

@Injectable()
export class CadastroPessoaMeuSetorService {
  constructor(
    private readonly _userInfo: UserInfo,
    private readonly _cadastroPessoaService: CadastroPessoasService,
    private readonly _consultaPessoaService: ConsultaPessoasService,
    private readonly _consultaCelulaService: ConsultaCelulasService,
  ) {}

  salvar(cadastro: CadastroPessoaMeuSetor): Observable<Pessoa> {
    return this._consultaCelulaService
      .consultarPeloId(cadastro.celulaId)
      .pipe(
        this._verificarCelula(),
        this._validarPermissaoSetor(),
        this._recuperarCadastroAtual(cadastro),
        this._salvarPessoa(cadastro),
      );
  }

  private _recuperarCadastroAtual(
    cadastro: CadastroPessoaMeuSetor,
  ): OperatorFunction<Celula, Pessoa | null> {
    return concatMap(() => {
      const inclusao$ = of(null);
      const edicao$ = defer(() =>
        this._consultaPessoaService.consultarPeloId(cadastro.id!).pipe(
          concatMap((pessoa) => {
            const encontrada$ = of(pessoa);
            const naoEncontrada$ = this._throwPessoaEditadaNaoEncontrada();
            return iif(() => !!pessoa, encontrada$, naoEncontrada$);
          }),
        ),
      );
      return iif(() => !!cadastro.id, edicao$, inclusao$);
    });
  }

  private _throwPessoaEditadaNaoEncontrada() {
    return throwError(
      () => new BadRequestException('Pessoa a ser editada não encontrada'),
    );
  }

  private _salvarPessoa(
    cadastro: CadastroPessoaMeuSetor,
  ): OperatorFunction<Pessoa | null, Pessoa> {
    return concatMap((pessoaSalva) =>
      this._cadastroPessoaService.salvar({
        ...cadastro,
        permissoes: {
          setor: cadastro.permissoes.setor,
          celula: cadastro.permissoes.celula,
          admin: pessoaSalva?.permissao.admin ?? false,
          missao: pessoaSalva?.permissao.missao ?? false,
        },
      }),
    );
  }

  private _validarPermissaoSetor(): OperatorFunction<Celula, Celula> {
    return concatMap((celula) => {
      const mesmoSetor$ = of(celula);
      const setorDiferente$ = this._throwEdicaoInvalida();
      const mesmoSetor =
        celula.setor.id === this._userInfo.pessoa!.celula.setor.id;
      return iif(() => mesmoSetor, mesmoSetor$, setorDiferente$);
    });
  }

  private _throwEdicaoInvalida() {
    return throwError(
      () =>
        new BadRequestException('Só é permitido alterar células do seu setor'),
    );
  }

  private _verificarCelula(): OperatorFunction<Celula | null, Celula> {
    return concatMap((celula) => {
      const existe$ = defer(() => of(celula!));
      const naoExiste$ = this._throwCelulaNaoEncontrada();
      return iif(() => !!celula, existe$, naoExiste$);
    });
  }

  private _throwCelulaNaoEncontrada() {
    return throwError(
      () => new BadRequestException('Célula informada não existe'),
    );
  }
}

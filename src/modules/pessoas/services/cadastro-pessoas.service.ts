import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  concatMap,
  defer,
  iif,
  Observable,
  of,
  OperatorFunction,
  throwError,
} from 'rxjs';
import { Op } from 'sequelize';
import { PERMISSAO_REPOSITORY, PESSOA_REPOSITORY } from '../../../constants';
import { PessoaMapper } from '../../../infra/database/mappers/pessoa.mapper';
import { PermissaoModel } from '../../../infra/database/models/permissao.model';
import { PessoaModel } from '../../../infra/database/models/pessoa.model';
import { TransactionObserver } from '../../../infra/database/transactions/transaction-observer';
import type { CadastroPessoa } from '../types/cadastro-pessoa';
import { Pessoa } from '../types/pessoa';

@Injectable()
export class CadastroPessoasService {
  private readonly _logger = new Logger(CadastroPessoasService.name);

  constructor(
    @Inject(PESSOA_REPOSITORY)
    private readonly _pessoaRepository: typeof PessoaModel,
    @Inject(PERMISSAO_REPOSITORY)
    private readonly _permissaoRepository: typeof PermissaoModel,
    private readonly _pessoaMapper: PessoaMapper,
  ) {}

  @TransactionObserver()
  salvar(cadastro: CadastroPessoa): Observable<Pessoa> {
    return defer(() => {
      const inclusao$ = this._inserir(cadastro);
      const edicao$ = this._alterar(cadastro);
      return iif(() => !!cadastro.id, edicao$, inclusao$);
    });
  }

  private _inserir(cadastro: CadastroPessoa): Observable<Pessoa> {
    return defer(() =>
      this._pessoaRepository.count({ where: { cpf: cadastro.cpf } }),
    ).pipe(
      this._testarCpfInclusao(),
      this._inserirNovaPessoa(cadastro),
      this._pessoaMapper.mapEntityNotNull(),
    );
  }

  private _alterar(cadastro: CadastroPessoa): Observable<Pessoa> {
    return defer(() => this._consultarOutraPessoaComMesmoCpf(cadastro)).pipe(
      this._testarCpfParaAlteracao(),
      this._alterarPessoa(cadastro),
      this._pessoaMapper.mapEntityNotNull(),
    );
  }

  private _inserirNovaPessoa(
    cadastro: CadastroPessoa,
  ): OperatorFunction<PessoaModel, PessoaModel> {
    return concatMap(async (pessoaModel) => {
      this._copiarAtributosPessoa(pessoaModel, cadastro);
      await pessoaModel.save();

      const permissaoModel = this._permissaoRepository.build();
      this._copiarAtributosPermissao(permissaoModel, cadastro, pessoaModel);
      await permissaoModel.save();

      const pessoaSalva = await this._carregarPessoaSalva(pessoaModel);
      return pessoaSalva!;
    });
  }

  private async _carregarPessoaSalva(pessoaModel: PessoaModel) {
    return await this._pessoaRepository.findByPk(pessoaModel.id, {
      include: [{ as: 'permissao', model: PermissaoModel }],
    });
  }

  private _testarCpfInclusao(): OperatorFunction<number, PessoaModel> {
    return concatMap((count) => {
      const cpfExiste$ = throwError(() => new Error('CPF já cadastrado'));
      const cpfNaoExiste$ = defer(() => of(this._pessoaRepository.build()));
      return iif(() => count > 0, cpfExiste$, cpfNaoExiste$);
    });
  }

  private _copiarAtributosPermissao(
    permissaoModel: PermissaoModel,
    cadastro: CadastroPessoa,
    pessoaModel: PessoaModel,
  ) {
    permissaoModel.missao = cadastro.permissoes.missao;
    permissaoModel.setor = cadastro.permissoes.setor;
    permissaoModel.celula = cadastro.permissoes.celula;
    permissaoModel.admin = cadastro.permissoes.admin;
    permissaoModel.pessoaId = pessoaModel.id;
  }

  private _copiarAtributosPessoa(
    pessoaModel: PessoaModel,
    cadastro: CadastroPessoa,
  ) {
    pessoaModel.nome = cadastro.nome;
    pessoaModel.cpf = cadastro.cpf;
    pessoaModel.email = cadastro.email;
    pessoaModel.celulaId = cadastro.celulaId;
  }

  private _alterarPessoa(
    cadastro: CadastroPessoa,
  ): OperatorFunction<boolean, PessoaModel> {
    return concatMap(async () => {
      const pessoaModel = await this._pessoaRepository.findByPk(cadastro.id, {
        include: [{ as: 'permissao', model: PermissaoModel }],
      });
      if (!pessoaModel) {
        throw new Error('Pessoa não encontrada');
      }

      this._copiarAtributosPessoa(pessoaModel, cadastro);
      await pessoaModel.save();

      const permissaoModel = pessoaModel.permissao;
      this._copiarAtributosPermissao(permissaoModel, cadastro, pessoaModel);
      await permissaoModel.save();

      return pessoaModel;
    });
  }

  private _testarCpfParaAlteracao(): OperatorFunction<number, boolean> {
    return concatMap((outrasPessoasComMesmoCpf) => {
      const cpfDuplicado$ = throwError(
        () => new Error('CPF já cadastrado para outra pessoa'),
      );
      return iif(() => outrasPessoasComMesmoCpf > 0, cpfDuplicado$, of(true));
    });
  }

  private _consultarOutraPessoaComMesmoCpf(
    cadastro: CadastroPessoa,
  ): Promise<number> {
    return this._pessoaRepository.count({
      where: { cpf: cadastro.cpf, id: { [Op.ne]: cadastro.id } },
    });
  }
}

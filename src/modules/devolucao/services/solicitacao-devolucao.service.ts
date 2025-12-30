import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  catchError,
  concatMap,
  iif,
  Observable,
  of,
  OperatorFunction,
  throwError,
} from 'rxjs';
import { DEVOLUCAO_REPOSITORY } from 'src/constants';
import { DevolucaoAdapter } from 'src/infra/database/adapters/devolucao.adapter';
import { DevolucaoModel } from 'src/infra/database/models/devolucao.model';
import { CobrancaService } from 'src/modules/cobranca/services/cobranca.service';
import { PessoasService } from 'src/modules/pessoas/services/pessoas.service';
import { Pessoa } from 'src/modules/pessoas/types/pessoa';
import { CustomError } from 'src/utils/custom-error';
import { SolicitacaoDevolucao } from '../types/solicitacao-devolucao';
import { Devolucao } from '../types/devolucao';
import { LinkPagamento } from '/workspaces/radix-api/src/modules/cobranca/types/link-pagamento';
import { PessoaModel } from 'src/infra/database/models/pessoa.model';

@Injectable()
export class SolicitacaoDevolucaoService {
  private readonly _logger = new Logger(SolicitacaoDevolucaoService.name);

  constructor(
    private readonly _pessoaService: PessoasService,
    private readonly _cobrancaService: CobrancaService,
    @Inject(DEVOLUCAO_REPOSITORY)
    private readonly _devolucaoRepository: typeof DevolucaoModel,
    private readonly _devolucaoAdapter: DevolucaoAdapter,
  ) {}

  gerar(solicitacao: SolicitacaoDevolucao): Observable<Devolucao> {
    return this._pessoaService
      .consultarPeloId(solicitacao.pessoaId)
      .pipe(
        this._verificarSePessoaExiste(),
        this._gerarCobrancaParaPagamento(solicitacao),
        this._salvarRegistroDevolucao(solicitacao),
        this._recarregarDevolucaoSalva(),
        this._catchErroAoSalvarDevolucao(),
        this._devolucaoAdapter.mapEntityNotNull(),
      );
  }

  private _catchErroAoSalvarDevolucao(): OperatorFunction<
    DevolucaoModel,
    DevolucaoModel
  > {
    return catchError((error: Error) => {
      this._logger.error(
        `Erro ao salvar registro de devolução: ${error.message}`,
        error.stack,
      );
      return throwError(
        () => new CustomError('Erro ao salvar o registro de devolução', 500),
      );
    });
  }

  private _recarregarDevolucaoSalva(): OperatorFunction<
    DevolucaoModel,
    DevolucaoModel
  > {
    return concatMap((devolucaoModel) =>
      devolucaoModel.reload({
        include: [{ as: 'pessoa', model: PessoaModel }],
      }),
    );
  }

  private _salvarRegistroDevolucao(
    solicitacao: SolicitacaoDevolucao,
  ): OperatorFunction<LinkPagamento, DevolucaoModel> {
    return concatMap((linkPagamento) => {
      const model = this._devolucaoRepository.build();
      model.dataCriacao = new Date();
      model.pessoaId = solicitacao.pessoaId;
      model.valorTotal = solicitacao.valor;
      model.mesReferencia = solicitacao.mesReferencia;
      model.anoReferencia = solicitacao.anoReferencia;
      model.urlPagamento = linkPagamento.invoiceUrl;
      model.numeroPagamento = linkPagamento.invoiceNumber;
      model.pagamentoId = linkPagamento.paymentId;
      model.codigoCliente = linkPagamento.customer;
      model.status = 'aguardando_pagamento';
      return model.save();
    });
  }

  private _gerarCobrancaParaPagamento(
    solicitacao: SolicitacaoDevolucao,
  ): OperatorFunction<Pessoa, LinkPagamento> {
    return concatMap((pessoa) =>
      this._cobrancaService.gerar({
        nome: pessoa.nome,
        cpf: pessoa.cpf,
        valor: solicitacao.valor,
        formaPagamento: solicitacao.formaPagamento,
      }),
    );
  }

  private _verificarSePessoaExiste(): OperatorFunction<Pessoa | null, Pessoa> {
    return concatMap((pessoa) => {
      const naoExiste$ = throwError(
        () => new CustomError('Pessoa não encontrada', 400),
      );
      const existe = of(pessoa!);
      return iif(() => pessoa !== null, existe, naoExiste$);
    });
  }
}

import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientNats } from '@nestjs/microservices';
import { Decimal } from 'decimal.js';
import {
  catchError,
  concatMap,
  iif,
  Observable,
  of,
  OperatorFunction,
  throwError,
} from 'rxjs';
import {
  CLIENT_NATS,
  DEVOLUCAO_REPOSITORY,
  EVENTO_ENVIO_LINK_PAGAMENTO,
} from 'src/constants';
import { UserInfo } from 'src/infra/auth/user-info/user-info';
import { DevolucaoMapper } from 'src/infra/database/mappers/devolucao.mapper';
import { DevolucaoModel } from 'src/infra/database/models/devolucao.model';
import { PessoaModel } from 'src/infra/database/models/pessoa.model';
import { CobrancaService } from 'src/modules/cobranca/services/cobranca.service';
import { ConsultaPessoasService } from 'src/modules/pessoas/services/consulta-pessoas.service';
import { Pessoa } from 'src/modules/pessoas/types/pessoa';
import { CustomError } from 'src/utils/custom-error';
import { EventoEnvioLinkPagamento } from '../events/link-pagamento-gerado';
import { Devolucao } from '../types/devolucao';
import { SolicitacaoDevolucao } from '../types/solicitacao-devolucao';
import { LinkPagamento } from '/workspaces/radix-api/src/modules/cobranca/types/link-pagamento';
import { CelulaModel } from 'src/infra/database/models/celula.model';
import { SetorModel } from 'src/infra/database/models/setor.model';
import { MissaoModel } from 'src/infra/database/models/missao.model';

@Injectable()
export class SolicitacaoDevolucaoService {
  private readonly _logger = new Logger(SolicitacaoDevolucaoService.name);

  constructor(
    private readonly _pessoaService: ConsultaPessoasService,
    private readonly _cobrancaService: CobrancaService,
    @Inject(DEVOLUCAO_REPOSITORY)
    private readonly _devolucaoRepository: typeof DevolucaoModel,
    private readonly _devolucaoAdapter: DevolucaoMapper,
    private readonly _userInfo: UserInfo,
    @Inject(CLIENT_NATS) private readonly _clientNats: ClientNats,
  ) {}

  gerar(solicitacao: SolicitacaoDevolucao): Observable<Devolucao> {
    return this._pessoaService
      .consultarPeloId(solicitacao.pessoaId)
      .pipe(
        this._verificarSePessoaExiste(),
        this._gerarCobrancaParaPagamento(solicitacao),
        this._salvarRegistroDevolucao(solicitacao),
        this._recarregarDevolucaoSalva(),
        this._solicitarEnvioComLinkDePagamento(),
        this._catchErroAoSalvarDevolucao(),
        this._devolucaoAdapter.mapEntityNotNull(),
      );
  }
  private _solicitarEnvioComLinkDePagamento(): OperatorFunction<
    DevolucaoModel,
    DevolucaoModel
  > {
    return concatMap((devolucaoModel) => {
      const evento: EventoEnvioLinkPagamento = {
        email: devolucaoModel.pessoa.email,
        nome: devolucaoModel.pessoa.nome,
        link: devolucaoModel.urlPagamento,
        valorComunhaoBens: +devolucaoModel.valorDizimo,
        valorFundoComunhao: +devolucaoModel.valorFundoComunhao,
        formaPagamento: 'cartao_credito',
        anoReferencia: +devolucaoModel.anoReferencia,
        mesReferencia: +devolucaoModel.mesReferencia,
        setor: devolucaoModel.pessoa.celula.setor.nome,
      };
      this._clientNats.emit(EVENTO_ENVIO_LINK_PAGAMENTO, evento);
      return of(devolucaoModel);
    });
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
    return concatMap((devolucaoModel) => {
      this._logger.log(
        `Recarregando devolução salva com ID ${devolucaoModel.id} para o usuário ${this._userInfo.pessoa?.nome} da célula ${this._userInfo.pessoa?.celula?.nome}`,
      );
      return devolucaoModel.reload({
        include: [
          {
            as: 'pessoa',
            model: PessoaModel,
            include: [
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
          },
        ],
      });
    });
  }

  private _salvarRegistroDevolucao(
    solicitacao: SolicitacaoDevolucao,
  ): OperatorFunction<LinkPagamento, DevolucaoModel> {
    return concatMap((linkPagamento) => {
      const model = this._devolucaoRepository.build();
      model.dataCriacao = new Date();
      model.pessoaId = solicitacao.pessoaId;
      model.solicitanteId = this._userInfo.pessoa!.id;
      model.valorDizimo = solicitacao.valorDizimo;
      model.valorFundoComunhao = solicitacao.valorFundoComunhao;
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
        valor: this._calcularValorTotal(solicitacao),
        formaPagamento: solicitacao.formaPagamento,
      }),
    );
  }

  private _calcularValorTotal(solicitacao: SolicitacaoDevolucao): number {
    const valor = new Decimal(solicitacao.valorDizimo).plus(
      solicitacao.valorFundoComunhao,
    );
    return valor.toNumber();
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

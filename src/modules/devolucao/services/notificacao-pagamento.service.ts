import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientNats } from '@nestjs/microservices';
import {
  catchError,
  concatMap,
  defer,
  iif,
  map,
  Observable,
  of,
  OperatorFunction,
  throwError,
} from 'rxjs';
import {
  CLIENT_NATS,
  DEVOLUCAO_REPOSITORY,
  EVENTO_DEVOLUCAO_REALIZADA,
} from 'src/constants';
import { CelulaModel } from 'src/infra/database/models/celula.model';
import { DevolucaoModel } from 'src/infra/database/models/devolucao.model';
import { MissaoModel } from 'src/infra/database/models/missao.model';
import { PessoaModel } from 'src/infra/database/models/pessoa.model';
import { SetorModel } from 'src/infra/database/models/setor.model';
import { TransactionObserver } from 'src/infra/database/transactions/transaction-observer';
import { CustomError } from 'src/utils/custom-error';
import { EventoDevolucaoRealizada } from '../events/devolucao-realizada.event';

@Injectable()
export class NotificacaoPagamentoService {
  private readonly _logger = new Logger(NotificacaoPagamentoService.name);

  constructor(
    @Inject(DEVOLUCAO_REPOSITORY)
    private readonly _devolucaoRepository: typeof DevolucaoModel,
    @Inject(CLIENT_NATS) private readonly _clientNats: ClientNats,
  ) {}

  @TransactionObserver()
  receber(pagamentoId: string): Observable<boolean> {
    return this._consultarDevolucaoPeloPagamentoId(pagamentoId).pipe(
      this._validarPagamento(),
      this._registrarPagamento(pagamentoId),
      this._enviarEmailConfirmacao(),
      map(() => true),
    );
  }

  private _enviarEmailConfirmacao(): OperatorFunction<
    DevolucaoModel,
    DevolucaoModel
  > {
    return concatMap((devolucao) => {
      const email = devolucao.pessoa.email;
      const evento: EventoDevolucaoRealizada = {
        email,
        mes: devolucao.mesReferencia,
        ano: devolucao.anoReferencia,
        nome: devolucao.pessoa.nome,
        setor: devolucao.pessoa.celula.setor.nome,
      };
      this._clientNats.emit(EVENTO_DEVOLUCAO_REALIZADA, evento);
      return of(devolucao);
    });
  }

  private _registrarPagamento(
    pagamentoId: string,
  ): OperatorFunction<DevolucaoModel, DevolucaoModel> {
    return concatMap((devolucaoModel) => {
      const processado$ = of(devolucaoModel);
      const naoProcessado$ = this._atualizarDevolucaoPaga(pagamentoId).pipe(
        this._catchErroAoRegistrarPagamento(),
        map(() => devolucaoModel),
      );
      return iif(
        () => devolucaoModel.status === 'pago',
        processado$,
        naoProcessado$,
      );
    });
  }

  private _catchErroAoRegistrarPagamento(): OperatorFunction<
    [affectedCount: number],
    [affectedCount: number]
  > {
    return catchError((err: Error) => {
      this._logger.error(
        'Erro ao processar notificação de pagamento',
        err.message,
        err.stack,
      );
      return throwError(
        () =>
          new CustomError(
            'Ocorre um erro ao processar a notificação de pagamento',
            500,
          ),
      );
    });
  }

  private _atualizarDevolucaoPaga(pagamentoId: string) {
    return defer(() =>
      this._devolucaoRepository.update(
        {
          status: 'pago',
          dataPagamento: new Date(),
        },
        {
          where: { pagamentoId },
        },
      ),
    );
  }

  private _consultarDevolucaoPeloPagamentoId(pagamentoId: string) {
    return defer(() =>
      this._devolucaoRepository.findOne({
        where: { pagamentoId },
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
      }),
    );
  }

  private _validarPagamento(): OperatorFunction<
    DevolucaoModel,
    DevolucaoModel
  > {
    return concatMap((devolucaoModel) => {
      const encontrado$ = defer(() => of(devolucaoModel));
      const naoEncontrado$ = this._throwPagamentoNaoEncontrado();
      return iif(() => !!devolucaoModel, encontrado$, naoEncontrado$);
    });
  }

  private _throwPagamentoNaoEncontrado() {
    return throwError(
      () =>
        new CustomError(
          'O identificador do pagamento não foi identificado',
          400,
        ),
    );
  }
}

import { Inject, Injectable, Logger } from '@nestjs/common';
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
import { DEVOLUCAO_REPOSITORY } from 'src/constants';
import { DevolucaoModel } from 'src/infra/database/models/devolucao.model';
import { TransactionObserver } from 'src/infra/database/transactions/transaction-observer';
import { CustomError } from 'src/utils/custom-error';

@Injectable()
export class NotificacaoPagamentoService {
  private readonly _logger = new Logger(NotificacaoPagamentoService.name);

  constructor(
    @Inject(DEVOLUCAO_REPOSITORY)
    private readonly _devolucaoRepository: typeof DevolucaoModel,
  ) {}

  @TransactionObserver()
  receber(pagamentoId: string): Observable<boolean> {
    return this._consultarDevolucaoPeloPagamentoId(pagamentoId).pipe(
      this._validarPagamento(),
      this._registrarPagamento(pagamentoId),
    );
  }

  private _registrarPagamento(
    pagamentoId: string,
  ): OperatorFunction<DevolucaoModel, boolean> {
    return concatMap((devolucaoModel) => {
      const processado$ = of(true);
      const naoProcessado$ = this._atualizarDevolucaoPaga(pagamentoId).pipe(
        this._catchErroAoRegistrarPagamento(),
        map(() => true),
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

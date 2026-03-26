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
import { CelulaModel } from 'src/infra/database/models/celula.model';
import { DevolucaoModel } from 'src/infra/database/models/devolucao.model';
import { MissaoModel } from 'src/infra/database/models/missao.model';
import { PessoaModel } from 'src/infra/database/models/pessoa.model';
import { SetorModel } from 'src/infra/database/models/setor.model';
import { TransactionObserver } from 'src/infra/database/transactions/transaction-observer';
import { Email } from 'src/infra/email/email';
import { EmailService } from 'src/infra/email/email.service';
import { CustomError } from 'src/utils/custom-error';

@Injectable()
export class NotificacaoPagamentoService {
  private readonly _logger = new Logger(NotificacaoPagamentoService.name);

  constructor(
    @Inject(DEVOLUCAO_REPOSITORY)
    private readonly _devolucaoRepository: typeof DevolucaoModel,
    private readonly _emailService: EmailService,
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
    Email | Observable<never>
  > {
    return concatMap((devolucao) => {
      const email = devolucao.pessoa.email;
      return this._emailService.enviar({
        assunto: 'Pagamento recebido',
        texto: this._montarMensagem(devolucao),
        endereco: email,
      });
    });
  }

  private _montarMensagem(devolucao: DevolucaoModel): string {
    return `Recebemos o valor da sua contribuição. Que Deus retribua a sua generosidade.<p>Atenciosamente,<br>Economato ${devolucao.pessoa.celula.setor.nome}</p>`;
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

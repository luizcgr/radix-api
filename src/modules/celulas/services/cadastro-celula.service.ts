import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { concatMap, defer, iif, Observable, of, throwError } from 'rxjs';
import { CELULA_REPOSITORY } from 'src/constants';
import { CelulaMapper } from 'src/infra/database/mappers/celula.mapper';
import { CelulaModel } from 'src/infra/database/models/celula.model';
import { TransactionObserver } from 'src/infra/database/transactions/transaction-observer';
import type { CadastroCelula } from '../types/cadastro-celula';
import { Celula } from '../types/celula';

@Injectable()
export class CadastroCelulaService {
  private readonly _logger = new Logger(CadastroCelulaService.name);

  constructor(
    @Inject(CELULA_REPOSITORY)
    private readonly _celulaRepository: typeof CelulaModel,
    private readonly _celulaMapper: CelulaMapper,
  ) {}

  @TransactionObserver()
  salvar(cadastro: CadastroCelula): Observable<Celula> {
    const inclusao$ = this._incluir(cadastro);
    const alterarao$ = this._alterar(cadastro);
    return iif(() => !!cadastro.id, alterarao$, inclusao$);
  }

  private _incluir(cadastro: CadastroCelula): Observable<Celula> {
    return defer(async () => {
      const model = this._celulaRepository.build();
      model.nome = cadastro.nome;
      model.setorId = cadastro.setorId;
      await model.save();
      return this._celulaMapper.map(model)!;
    });
  }

  private _alterar(cadastro: CadastroCelula): Observable<Celula> {
    return defer(() => this._celulaRepository.findByPk(cadastro.id)).pipe(
      concatMap((model) => {
        const existe$ = defer(() => of(model!));
        const naoExiste$ = throwError(
          () => new BadRequestException('Célula não encontrada para alteração'),
        );
        return iif(() => !!model, existe$, naoExiste$);
      }),
      concatMap((model) => {
        model.nome = cadastro.nome;
        model.setorId = cadastro.setorId;
        return model.save();
      }),
      this._celulaMapper.mapEntityNotNull(),
    );
  }
}

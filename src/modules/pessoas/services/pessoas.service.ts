import { Inject, Injectable } from '@nestjs/common';
import { defer, Observable, of } from 'rxjs';
import { PESSOA_REPOSITORY } from 'src/constants';
import { PessoaAdapter } from 'src/infra/database/adapters/pessoa.adapter';
import { PessoaModel } from 'src/infra/database/models/pessoa.model';
import { TransactionObserver } from 'src/infra/database/transactions/transaction-observer';
import { Pessoa } from '../types/pessoa';

@Injectable()
export class PessoasService {
  constructor(
    @Inject(PESSOA_REPOSITORY)
    private readonly _pessoaRepository: typeof PessoaModel,
    private readonly _pessoaAdapter: PessoaAdapter,
  ) {}

  @TransactionObserver()
  consultar(): Observable<Pessoa[]> {
    return of([]);
  }

  consultarPeloId(pessoaId: number): Observable<Pessoa | null> {
    return defer(() => this._pessoaRepository.findByPk(pessoaId)).pipe(
      this._pessoaAdapter.mapEntity(),
    );
  }
}

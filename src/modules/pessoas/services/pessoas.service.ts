import { Injectable } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { TransactionObserver } from 'src/infra/database/transactions/transaction-observer';
import { Pessoa } from '../types/pessoa';

@Injectable()
export class PessoasService {
  @TransactionObserver()
  consultar(): Observable<Pessoa[]> {
    return of([]);
  }
}

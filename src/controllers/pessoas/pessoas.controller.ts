import { Controller, Get } from '@nestjs/common';
import { TransactionObserver } from 'src/infra/database/transactions/transaction-observer';

@Controller({ path: 'v1/pessoas' })
export class PessoasController {
  @TransactionObserver()
  @Get()
  heath() {
    return { status: 'ok' };
  }
}

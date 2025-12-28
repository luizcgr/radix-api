import { Module } from '@nestjs/common';
import { PagamentoModule } from '../pagamento/pagamento.module';

@Module({
  imports: [PagamentoModule],
  providers: [],
  exports: [],
})
export class DevolucaoModel {}

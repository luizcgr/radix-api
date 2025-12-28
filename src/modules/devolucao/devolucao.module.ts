import { Module } from '@nestjs/common';
import { PagamentoModule } from '../cobranca/pagamento.module';
import { PessoasModule } from '../pessoas/pessoas.module';
import { SolicitacaoDevolucaoService } from './services/solicitacao-devolucao.service';

@Module({
  imports: [PessoasModule, PagamentoModule],
  providers: [SolicitacaoDevolucaoService],
  exports: [SolicitacaoDevolucaoService],
})
export class DevolucaoModule {}

import { Module } from '@nestjs/common';
import { PagamentoModule } from '../cobranca/pagamento.module';
import { PessoasModule } from '../pessoas/pessoas.module';
import { NotificacaoPagamentoService } from './services/notificacao-pagamento.service';
import { SolicitacaoDevolucaoService } from './services/solicitacao-devolucao.service';

@Module({
  imports: [PessoasModule, PagamentoModule],
  providers: [SolicitacaoDevolucaoService, NotificacaoPagamentoService],
  exports: [SolicitacaoDevolucaoService, NotificacaoPagamentoService],
})
export class DevolucaoModule {}

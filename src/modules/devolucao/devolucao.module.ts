import { Module } from '@nestjs/common';
import { PagamentoModule } from '../cobranca/pagamento.module';
import { PessoasModule } from '../pessoas/pessoas.module';
import { ConsultaDevolucoesService } from './services/consulta-devolucoes.service';
import { NotificacaoPagamentoService } from './services/notificacao-pagamento.service';
import { SolicitacaoDevolucaoService } from './services/solicitacao-devolucao.service';

@Module({
  imports: [PessoasModule, PagamentoModule],
  providers: [
    SolicitacaoDevolucaoService,
    NotificacaoPagamentoService,
    ConsultaDevolucoesService,
  ],
  exports: [
    SolicitacaoDevolucaoService,
    NotificacaoPagamentoService,
    ConsultaDevolucoesService,
  ],
})
export class DevolucaoModule {}

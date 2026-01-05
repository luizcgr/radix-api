import { Module } from '@nestjs/common';
import { PagamentoModule } from '../cobranca/pagamento.module';
import { PessoasModule } from '../pessoas/pessoas.module';
import { ConsultaDevolucoesService } from './services/consulta-devolucoes.service';
import { NotificacaoPagamentoService } from './services/notificacao-pagamento.service';
import { RelatorioCelulaService } from './services/relatorio-celula.service';
import { SolicitacaoDevolucaoService } from './services/solicitacao-devolucao.service';

@Module({
  imports: [PessoasModule, PagamentoModule],
  providers: [
    SolicitacaoDevolucaoService,
    NotificacaoPagamentoService,
    ConsultaDevolucoesService,
    RelatorioCelulaService,
  ],
  exports: [
    SolicitacaoDevolucaoService,
    NotificacaoPagamentoService,
    ConsultaDevolucoesService,
    RelatorioCelulaService,
  ],
})
export class DevolucaoModule {}

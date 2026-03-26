import { Module } from '@nestjs/common';
import { EmailModule } from 'src/infra/email/email.module';
import { PagamentoModule } from '../cobranca/pagamento.module';
import { PessoasModule } from '../pessoas/pessoas.module';
import { ConsultaDevolucoesService } from './services/consulta-devolucoes.service';
import { NotificacaoPagamentoService } from './services/notificacao-pagamento.service';
import { RelatorioCelulaService } from './services/relatorio-celula.service';
import { RelatorioDevolucaoService } from './services/relatorio-devolucao.service';
import { RelatorioEvolucaoService } from './services/relatorio-evolucao.service';
import { RelatorioMissaoService } from './services/relatorio-missao.service';
import { RelatorioSetorService } from './services/relatorio-setor.service';
import { SolicitacaoDevolucaoService } from './services/solicitacao-devolucao.service';

@Module({
  imports: [PessoasModule, PagamentoModule, EmailModule],
  providers: [
    SolicitacaoDevolucaoService,
    NotificacaoPagamentoService,
    ConsultaDevolucoesService,
    RelatorioCelulaService,
    RelatorioSetorService,
    RelatorioMissaoService,
    RelatorioEvolucaoService,
    RelatorioDevolucaoService,
  ],
  exports: [
    SolicitacaoDevolucaoService,
    NotificacaoPagamentoService,
    ConsultaDevolucoesService,
    RelatorioCelulaService,
    RelatorioSetorService,
    RelatorioMissaoService,
    RelatorioDevolucaoService,
  ],
})
export class DevolucaoModule {}

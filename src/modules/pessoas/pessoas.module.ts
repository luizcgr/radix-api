import { Module } from '@nestjs/common';
import { CelulasModule } from '../celulas/celulas.module';
import { CadastroPessoaMeuSetorService } from './services/cadastro-pessoa-meu-setor.service';
import { CadastroPessoasService } from './services/cadastro-pessoas.service';
import { ConsultaPessoasService } from './services/consulta-pessoas.service';

@Module({
  imports: [CelulasModule],
  providers: [
    ConsultaPessoasService,
    CadastroPessoasService,
    CadastroPessoaMeuSetorService,
  ],
  exports: [
    ConsultaPessoasService,
    CadastroPessoasService,
    CadastroPessoaMeuSetorService,
  ],
})
export class PessoasModule {}

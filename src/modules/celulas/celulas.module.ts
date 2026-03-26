import { Module } from '@nestjs/common';
import { CadastroCelulaMeuSetorService } from './services/cadastro-celula-meu-setor.service';
import { CadastroCelulaService } from './services/cadastro-celula.service';
import { ConsultaCelulasService } from './services/consulta-celulas.service';

@Module({
  providers: [
    ConsultaCelulasService,
    CadastroCelulaService,
    CadastroCelulaMeuSetorService,
  ],
  exports: [
    ConsultaCelulasService,
    CadastroCelulaService,
    CadastroCelulaMeuSetorService,
  ],
})
export class CelulasModule {}

import { Module } from '@nestjs/common';
import { ConsultaPessoasService } from './services/consulta-pessoas.service';
import { CadastroPessoasService } from './services/cadastro-pessoas.service';

@Module({
  imports: [],
  providers: [ConsultaPessoasService, CadastroPessoasService],
  exports: [ConsultaPessoasService, CadastroPessoasService],
})
export class PessoasModule {}

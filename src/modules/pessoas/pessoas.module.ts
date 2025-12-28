import { Module } from '@nestjs/common';
import { PessoaRepository } from './repositories/pessoa.repository';
import { PessoasService } from './services/pessoas.service';

@Module({
  imports: [],
  providers: [PessoaRepository, PessoasService],
  exports: [PessoasService],
})
export class PessoasModule {}

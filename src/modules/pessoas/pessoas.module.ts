import { Module } from '@nestjs/common';
import { PessoasService } from './services/pessoas.service';

@Module({
  imports: [],
  providers: [PessoasService],
  exports: [PessoasService],
})
export class PessoasModule {}

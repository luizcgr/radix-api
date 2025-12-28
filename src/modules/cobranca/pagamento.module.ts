import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { CobrancaService } from './services/cobranca.service';

@Module({
  imports: [HttpModule],
  providers: [CobrancaService],
  exports: [CobrancaService],
})
export class PagamentoModule {}

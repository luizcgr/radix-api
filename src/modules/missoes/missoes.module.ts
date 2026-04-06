import { Module } from '@nestjs/common';
import { ConsultaMissoesService } from './services/consulta-missoes.service';

@Module({
  controllers: [],
  providers: [ConsultaMissoesService],
})
export class MissoesModule {}

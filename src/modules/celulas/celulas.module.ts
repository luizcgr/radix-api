import { Module } from '@nestjs/common';
import { ConsultaCelulasService } from './services/consulta-celulas.service';

@Module({
  providers: [ConsultaCelulasService],
  exports: [ConsultaCelulasService],
})
export class CelulasModule {}

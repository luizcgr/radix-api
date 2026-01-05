import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { Roles } from 'src/infra/auth/decorators/roles.decorator';
import { RelatorioCelulaService } from 'src/modules/devolucao/services/relatorio-celula.service';

@Controller('v1/relatorios')
export class RelatoriosController {
  constructor(
    private readonly _relatorioCelulaService: RelatorioCelulaService,
  ) {}

  @Roles('celula')
  @Get('celula/:celulaId/:mesReferencia/:anoReferencia/')
  gerarRelatorioCelula(
    @Param('celulaId', ParseIntPipe) celulaId: number,
    @Param('mesReferencia', ParseIntPipe) mesReferencia: number,
    @Param('anoReferencia', ParseIntPipe) anoReferencia: number,
  ) {
    return this._relatorioCelulaService.gerar({
      celulaId,
      mesReferencia,
      anoReferencia,
    });
  }
}

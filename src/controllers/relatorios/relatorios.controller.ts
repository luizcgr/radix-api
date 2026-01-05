import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { Roles } from 'src/infra/auth/decorators/roles.decorator';
import { UserInfo } from 'src/infra/auth/user-info/user-info';
import { RelatorioCelulaService } from 'src/modules/devolucao/services/relatorio-celula.service';

@Controller('v1/relatorios')
export class RelatoriosController {
  constructor(
    private readonly _userInfo: UserInfo,
    private readonly _relatorioCelulaService: RelatorioCelulaService,
  ) {}

  @Roles('setor', 'missao')
  @Get('celulas/:celulaId/:mesReferencia/:anoReferencia/')
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

  @Roles('celula')
  @Get('minha-celula/:mesReferencia/:anoReferencia/')
  gerarRelatorioMinhaCelula(
    @Param('mesReferencia', ParseIntPipe) mesReferencia: number,
    @Param('anoReferencia', ParseIntPipe) anoReferencia: number,
  ) {
    return this._relatorioCelulaService.gerar({
      celulaId: this._userInfo.pessoa!.celula.id,
      mesReferencia,
      anoReferencia,
    });
  }
}

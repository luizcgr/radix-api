import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { Roles } from 'src/infra/auth/decorators/roles.decorator';
import { UserInfo } from 'src/infra/auth/user-info/user-info';
import { RelatorioCelulaService } from 'src/modules/devolucao/services/relatorio-celula.service';
import { RelatorioMissaoService } from 'src/modules/devolucao/services/relatorio-missao.service';
import { RelatorioSetorService } from 'src/modules/devolucao/services/relatorio-setor.service';

@Controller({ path: 'v1/minha-missao' })
export class MinhaMissaoController {
  constructor(
    private readonly _userInfo: UserInfo,
    private readonly _relatorioMissaoService: RelatorioMissaoService,
    private readonly _relatorioSetorService: RelatorioSetorService,
    private readonly _relatorioCelulaService: RelatorioCelulaService,
  ) {}

  @Roles('missao')
  @Get('relatorio/mes/:mesReferencia/ano/:anoReferencia')
  consultarRelatorioMissao(
    @Param('mesReferencia', ParseIntPipe) mesReferencia: number,
    @Param('anoReferencia', ParseIntPipe) anoReferencia: number,
  ) {
    const missaoId = this._userInfo.pessoa!.celula.setor.missao.id;
    return this._relatorioMissaoService.gerar({
      missaoId,
      mesReferencia,
      anoReferencia,
    });
  }

  @Roles('missao')
  @Get('setores/:setorId/mes/:mesReferencia/ano/:anoReferencia')
  consultarRelatorioSetor(
    @Param('setorId', ParseIntPipe) setorId: number,
    @Param('mesReferencia', ParseIntPipe) mesReferencia: number,
    @Param('anoReferencia', ParseIntPipe) anoReferencia: number,
  ) {
    const missaoId = this._userInfo.pessoa!.celula.setor.missao.id;
    return this._relatorioSetorService.gerar({
      setorId,
      mesReferencia,
      anoReferencia,
      missaoId,
    });
  }

  @Roles('missao')
  @Get('celulas/:celulaId/mes/:mesReferencia/ano/:anoReferencia')
  consultarRelatorioCelula(
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

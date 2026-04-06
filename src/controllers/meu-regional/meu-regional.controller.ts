import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { Roles } from 'src/infra/auth/decorators/roles.decorator';
import { UserInfo } from 'src/infra/auth/user-info/user-info';
import { RelatorioMissaoService } from 'src/modules/devolucao/services/relatorio-missao.service';
import { RelatorioRegionalService } from 'src/modules/devolucao/services/relatorio-regional.service';

@Controller({ path: 'v1/meu-regional' })
export class MeuRegionalController {
  constructor(
    private readonly _userInfo: UserInfo,
    private readonly _relatorioRegionalService: RelatorioRegionalService,
    private readonly _relatorioMissaoService: RelatorioMissaoService,
  ) {}

  @Roles('regional')
  @Get('relatorio/mes/:mesReferencia/ano/:anoReferencia')
  gerarRelatorioSetor(
    @Param('mesReferencia', ParseIntPipe) mesReferencia: number,
    @Param('anoReferencia', ParseIntPipe) anoReferencia: number,
  ) {
    return this._relatorioRegionalService.gerar({
      regionalId: this._userInfo.pessoa!.celula.setor.missao.regional.id,
      mesReferencia,
      anoReferencia,
    });
  }

  @Roles('regional')
  @Get('missoes/:missaoId')
  gerarRelatorioMissaoMeuRegional(
    @Param('missaoId', ParseIntPipe) missaoId: number,
    @Query('anoReferencia', ParseIntPipe) anoReferencia?: number,
    @Query('mesReferencia', ParseIntPipe) mesReferencia?: number,
  ) {
    return this._relatorioMissaoService.gerar({
      missaoId,
      anoReferencia: anoReferencia ?? new Date().getFullYear(),
      mesReferencia: mesReferencia ?? new Date().getMonth() + 1,
    });
  }
}

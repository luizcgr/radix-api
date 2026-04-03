import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { Roles } from 'src/infra/auth/decorators/roles.decorator';
import { UserInfo } from 'src/infra/auth/user-info/user-info';
import { RelatorioRegionalService } from 'src/modules/devolucao/services/relatorio-regional.service';

@Controller({ path: 'v1/meu-regional' })
export class MeuRegionalController {
  constructor(
    private readonly _userInfo: UserInfo,
    private readonly _relatorioRegionalService: RelatorioRegionalService,
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
}

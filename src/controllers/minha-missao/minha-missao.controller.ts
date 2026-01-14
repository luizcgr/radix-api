import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { Roles } from 'src/infra/auth/decorators/roles.decorator';
import { UserInfo } from 'src/infra/auth/user-info/user-info';
import { RelatorioMissaoService } from 'src/modules/devolucao/services/relatorio-missao.service';

@Controller({ path: 'v1/minha-missao' })
export class MinhaMissaoController {
  constructor(
    private readonly _userInfo: UserInfo,
    private readonly _relatorioMissaoService: RelatorioMissaoService,
  ) {}

  @Roles('missao')
  @Get('relatorio/mes/:mesReferencia/ano/:anoReferencia')
  consultar(
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
}

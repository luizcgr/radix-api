import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { map } from 'rxjs';
import { Roles } from 'src/infra/auth/decorators/roles.decorator';
import { UserInfo } from 'src/infra/auth/user-info/user-info';
import { ConsultaCelulasService } from 'src/modules/celulas/services/consulta-celulas.service';
import { ConsultaDevolucoesService } from 'src/modules/devolucao/services/consulta-devolucoes.service';
import { RelatorioCelulaService } from 'src/modules/devolucao/services/relatorio-celula.service';
import { RelatorioSetorService } from 'src/modules/devolucao/services/relatorio-setor.service';

@Controller({ path: 'v1/meu-setor' })
export class MeuSetorController {
  constructor(
    private readonly _userInfo: UserInfo,
    private readonly _consultaCelulasService: ConsultaCelulasService,
    private readonly _relatorioCelulaService: RelatorioCelulaService,
    private readonly _consultaDevolucoesService: ConsultaDevolucoesService,
    private readonly _relatorioSetorService: RelatorioSetorService,
  ) {}

  @Roles('setor')
  @Get('relatorio/mes/:mesReferencia/ano/:anoReferencia')
  gerarRelatorioSetor(
    @Param('mesReferencia', ParseIntPipe) mesReferencia: number,
    @Param('anoReferencia', ParseIntPipe) anoReferencia: number,
  ) {
    return this._relatorioSetorService.gerar({
      setorId: this._userInfo.pessoa!.celula.setor.id,
      mesReferencia,
      anoReferencia,
    });
  }

  @Roles('setor')
  @Get('celulas')
  consultarCelulasDoSetor() {
    return this._consultaCelulasService
      .consultar({
        setorId: this._userInfo.pessoa!.celula.setor.id,
      })
      .pipe(
        map((celulas) =>
          celulas.map((celula) => ({ id: celula.id, nome: celula.nome })),
        ),
      );
  }

  @Roles('setor')
  @Get('celulas/:celulaId/mes/:mesReferencia/ano/:anoReferencia')
  gerarRelatorioCelulaMeuSetor(
    @Param('celulaId', ParseIntPipe) celulaId: number,
    @Param('mesReferencia', ParseIntPipe) mesReferencia: number,
    @Param('anoReferencia', ParseIntPipe) anoReferencia: number,
  ) {
    return this._relatorioCelulaService.gerar({
      celulaId,
      mesReferencia,
      anoReferencia,
      setorId: this._userInfo.pessoa!.celula.setor.id,
    });
  }

  @Roles('setor')
  @Get('pessoas/:pessoaId/ano/:anoReferencia')
  consultarDevolucoesCelulaMeuSetor(
    @Param('anoReferencia', ParseIntPipe) anoReferencia: number,
    @Param('pessoaId', ParseIntPipe) pessoaId: number,
  ) {
    return this._consultaDevolucoesService.consultar({
      anoReferencia,
      pessoaId,
      setorId: this._userInfo.pessoa!.celula.setor.id,
    });
  }
}

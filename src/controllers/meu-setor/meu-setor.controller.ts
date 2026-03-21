import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { map } from 'rxjs';
import { Roles } from 'src/infra/auth/decorators/roles.decorator';
import { UserInfo } from 'src/infra/auth/user-info/user-info';
import { ConsultaCelulasService } from 'src/modules/celulas/services/consulta-celulas.service';
import { RelatorioCelulaService } from 'src/modules/devolucao/services/relatorio-celula.service';
import { RelatorioDevolucaoService } from 'src/modules/devolucao/services/relatorio-devolucao.service';
import { RelatorioSetorService } from 'src/modules/devolucao/services/relatorio-setor.service';
import { ConsultaPessoasService } from 'src/modules/pessoas/services/consulta-pessoas.service';
import { ConsultaPessoasMeuSetorDto } from './consulta-pessoas-meu-setor.dto';

@Controller({ path: 'v1/meu-setor' })
export class MeuSetorController {
  constructor(
    private readonly _userInfo: UserInfo,
    private readonly _consultaCelulasService: ConsultaCelulasService,
    private readonly _relatorioCelulaService: RelatorioCelulaService,
    private readonly _relatorioSetorService: RelatorioSetorService,
    private readonly _relatorioDevolucaoService: RelatorioDevolucaoService,
    private readonly _consultaPessoasService: ConsultaPessoasService,
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
    return this._relatorioDevolucaoService.gerar({
      anoReferencia,
      pessoaId,
      setorId: this._userInfo.pessoa!.celula.setor.id,
    });
  }

  @Roles('setor')
  @Get('pessoas')
  consultarPessoas(@Query() query: ConsultaPessoasMeuSetorDto) {
    return this._consultaPessoasService.consultar({
      ...query,
      setorId: this._userInfo.pessoa!.celula.setor.id,
      missaoId: this._userInfo.pessoa!.celula.setor.missao.id,
    });
  }
}

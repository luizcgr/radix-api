import { Controller, Get, Param, ParseIntPipe, Res } from '@nestjs/common';
import type { Response } from 'express';
import { Roles } from 'src/infra/auth/decorators/roles.decorator';
import { UserInfo } from 'src/infra/auth/user-info/user-info';
import { ConsultaDevolucoesService } from 'src/modules/devolucao/services/consulta-devolucoes.service';
import { RelatorioCelulaService } from 'src/modules/devolucao/services/relatorio-celula.service';
import { CustomError } from 'src/utils/custom-error';

@Controller({ path: 'v1/minha-celula' })
export class MinhaCelulaController {
  constructor(
    private readonly _userInfo: UserInfo,
    private readonly _relatorioCelulaService: RelatorioCelulaService,
    private readonly _consultaDevolucoesService: ConsultaDevolucoesService,
  ) {}

  @Roles('celula')
  @Get('mes/:mesReferencia/ano/:anoReferencia')
  consultarRelatorio(
    @Param('mesReferencia', ParseIntPipe) mesReferencia: number,
    @Param('anoReferencia', ParseIntPipe) anoReferencia: number,
    @Res() res: Response,
  ) {
    return this._relatorioCelulaService
      .gerar({
        celulaId: this._userInfo.pessoa!.celula.id,
        mesReferencia,
        anoReferencia,
      })
      .subscribe({
        error: (error: CustomError) =>
          res.status(error.code).json({ message: error.message }),
        next: (relatorio) => {
          res.status(200).json(relatorio);
        },
      });
  }

  @Roles('celula')
  @Get('ano/:anoReferencia/pessoa/:pessoaId')
  consultarDevolucoes(
    @Param('anoReferencia', ParseIntPipe) anoReferencia: number,
    @Param('pessoaId', ParseIntPipe) pessoaId: number,
    @Res() res: Response,
  ) {
    return this._consultaDevolucoesService
      .consultar({
        anoReferencia,
        pessoaId,
        celulaId: this._userInfo.pessoa!.celula.id,
      })
      .subscribe({
        error: (error: CustomError) =>
          res.status(error.code).json({ message: error.message }),
        next: (devolucoes) => {
          res.status(200).json(devolucoes);
        },
      });
  }
}

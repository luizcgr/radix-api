import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { Roles } from 'src/infra/auth/decorators/roles.decorator';
import { UserInfo } from 'src/infra/auth/user-info/user-info';
import { DevolucaoCelulaAdapter } from 'src/infra/database/adapters/devolucao-celula.adapter';
import { ConsultaDevolucoesService } from 'src/modules/devolucao/services/consulta-devolucoes.service';
import { SolicitacaoDevolucaoService } from 'src/modules/devolucao/services/solicitacao-devolucao.service';
import { CustomError } from 'src/utils/custom-error';
import { SolicitacaoDevolucaoPessoalDto } from './solicitacao-devolucao.dto';

@Controller({ path: 'v1/devolucoes' })
export class DevolucaoController {
  constructor(
    private readonly _solicitacaoDevolucaoService: SolicitacaoDevolucaoService,
    private readonly _consultaDevolucoesService: ConsultaDevolucoesService,
    private readonly _userInfo: UserInfo,
    private readonly _devolucaoCelulaAdapter: DevolucaoCelulaAdapter,
  ) {}

  @Get('pessoais')
  consultarDevolucoesPessoais(@Res() res: Response) {
    return this._consultaDevolucoesService
      .consultar({
        pessoaId: this._userInfo.pessoa!.id,
        anoReferencia: new Date().getFullYear(),
      })
      .subscribe({
        next: (devolucoes) => {
          res.status(200).json(devolucoes);
        },
        error: (error: CustomError) => {
          res.status(error.code).json({ message: error.message });
        },
      });
  }

  @Post()
  solicitarDevolucaoPessoal(
    @Body() solicitacao: SolicitacaoDevolucaoPessoalDto,
    @Res() res: Response,
  ) {
    return this._solicitacaoDevolucaoService
      .gerar({
        valor: solicitacao.valor,
        mesReferencia: solicitacao.mesReferencia,
        anoReferencia: solicitacao.anoReferencia,
        pessoaId: this._userInfo.pessoa!.id,
        formaPagamento: solicitacao.formaPagamento,
      })
      .subscribe({
        next: (devolucao) => {
          res.status(201).json(devolucao);
        },
        error: (error: CustomError) => {
          res.status(error.code).json({ message: error.message });
        },
      });
  }

  @Roles('celula', 'setor', 'missao')
  @Get('celulas/ano/:anoReferencia/pessoa/:pessoaId')
  consultarDevolucoesCelula(
    @Param('anoReferencia', ParseIntPipe) anoReferencia: number,
    @Param('pessoaId', ParseIntPipe) pessoaId: number,
    @Res() res: Response,
  ) {
    return this._consultaDevolucoesService
      .consultar({
        anoReferencia,
        pessoaId,
      })
      .pipe(this._devolucaoCelulaAdapter.mapEntityList())
      .subscribe({
        error: (error: CustomError) => {
          res.status(error.code).json({ message: error.message });
        },
        next: (devolucoes) => {
          res.status(200).json(devolucoes);
        },
      });
  }
}

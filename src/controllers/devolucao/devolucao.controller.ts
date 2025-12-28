import { Body, Controller, Post, Res } from '@nestjs/common';
import { SolicitacaoDevolucaoService } from 'src/modules/devolucao/services/solicitacao-devolucao.service';
import { SolicitacaoDevolucaoDto } from './solicitacao-devolucao.dto';
import type { Response } from 'express';
import { CustomError } from 'src/utils/custom-error';

@Controller({ path: 'v1/devolucoes' })
export class DevolucaoController {
  constructor(
    private readonly _solicitacaoDevolucaoService: SolicitacaoDevolucaoService,
  ) {}

  @Post()
  solicitarDevolucao(
    @Body() solicitacao: SolicitacaoDevolucaoDto,
    @Res() res: Response,
  ) {
    return this._solicitacaoDevolucaoService
      .gerar({
        valor: solicitacao.valor,
        mesReferencia: solicitacao.mesReferencia,
        anoReferencia: solicitacao.anoReferencia,
        pessoaId: solicitacao.pessoaId,
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
}

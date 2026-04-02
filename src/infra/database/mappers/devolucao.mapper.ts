import { Injectable } from '@nestjs/common';
import { Devolucao } from 'src/modules/devolucao/types/devolucao';
import { DevolucaoModel } from '../models/devolucao.model';
import { ModelMapper } from './model.mapper';
import { PessoaMapper } from './pessoa.mapper';

@Injectable()
export class DevolucaoMapper extends ModelMapper<DevolucaoModel, Devolucao> {
  constructor(private readonly _pessoaMapper: PessoaMapper) {
    super();
  }

  map(model: DevolucaoModel): Devolucao | null {
    if (!model) {
      return null;
    }
    return {
      id: +model.id,
      dataCriacao: model.dataCriacao,
      dataPagamento: model.dataPagamento,
      anoReferencia: model.anoReferencia,
      mesReferencia: model.mesReferencia,
      status: model.status,
      pagamentoId: model.pagamentoId,
      urlPagamento: model.urlPagamento,
      numeroPagamento: model.numeroPagamento,
      codigoCliente: model.codigoCliente,
      valorDizimo: model.valorDizimo,
      valorFundoComunhao: model.valorFundoComunhao,
      formaPagamento: model.formaPagamento,
      pessoa: this._pessoaMapper.map(model.pessoa)!,
      solicitante: this._pessoaMapper.map(model.solicitante)!,
      dataEmailConfirmacao: model.dataEmailConfirmacao,
    };
  }
}

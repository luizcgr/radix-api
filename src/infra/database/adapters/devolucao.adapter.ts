import { Injectable } from '@nestjs/common';
import { Devolucao } from 'src/modules/devolucao/types/devolucao';
import { DevolucaoModel } from '../models/devolucao.model';
import { ModelAdapter } from './model.adapter';
import { PessoaAdapter } from './pessoa.adapter';

@Injectable()
export class DevolucaoAdapter extends ModelAdapter<DevolucaoModel, Devolucao> {
  constructor(private readonly _pessoaAdapter: PessoaAdapter) {
    super();
  }

  adapt(model: DevolucaoModel): Devolucao | null {
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
      valorTotal: model.valorTotal,
      pessoa: this._pessoaAdapter.adapt(model.pessoa)!,
      solicitante: this._pessoaAdapter.adapt(model.solicitante)!,
    };
  }
}

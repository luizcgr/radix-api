import { Injectable } from '@nestjs/common';
import { DevolucaoCelula } from 'src/modules/devolucao/types/devolucao-celula';
import { DevolucaoModel } from '../models/devolucao.model';
import { ModelAdapter } from './model.adapter';

@Injectable()
export class DevolucaoCelulaAdapter extends ModelAdapter<
  DevolucaoModel,
  DevolucaoCelula
> {
  constructor() {
    super();
  }

  adapt(model: DevolucaoModel): DevolucaoCelula | null {
    if (!model) {
      return null;
    }
    return {
      id: +model.id,
      anoReferencia: model.anoReferencia,
      mesReferencia: model.mesReferencia,
      status: model.status,
    };
  }
}

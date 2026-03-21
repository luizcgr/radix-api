import { Injectable } from '@nestjs/common';
import { DevolucaoCelula } from 'src/modules/devolucao/types/devolucao-celula';
import { DevolucaoModel } from '../models/devolucao.model';
import { ModelMapper } from './model.mapper';

@Injectable()
export class DevolucaoCelulaMapper extends ModelMapper<
  DevolucaoModel,
  DevolucaoCelula
> {
  constructor() {
    super();
  }

  map(model: DevolucaoModel): DevolucaoCelula | null {
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

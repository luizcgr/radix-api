import { Injectable } from '@nestjs/common';
import { Celula } from 'src/modules/celulas/types/celula';
import { CelulaModel } from '../models/celula.model';
import { ModelAdapter } from './model.adapter';
import { SetorAdapter } from './setor.adapter';

@Injectable()
export class CelulaAdapter extends ModelAdapter<CelulaModel, Celula> {
  constructor(private readonly _setorAdapter: SetorAdapter) {
    super();
  }

  adapt(model: CelulaModel): Celula | null {
    if (!model) {
      return null;
    }
    return {
      id: +model.id,
      nome: model.nome,
      setor: this._setorAdapter.adapt(model.setor)!,
    };
  }
}

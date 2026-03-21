import { Injectable } from '@nestjs/common';
import { Celula } from 'src/modules/celulas/types/celula';
import { CelulaModel } from '../models/celula.model';
import { ModelMapper } from './model.mapper';
import { SetorMapper } from './setor.mapper';

@Injectable()
export class CelulaMapper extends ModelMapper<CelulaModel, Celula> {
  constructor(private readonly _setorMapper: SetorMapper) {
    super();
  }

  map(model: CelulaModel): Celula | null {
    if (!model) {
      return null;
    }
    return {
      id: +model.id,
      nome: model.nome,
      setor: this._setorMapper.map(model.setor)!,
    };
  }
}

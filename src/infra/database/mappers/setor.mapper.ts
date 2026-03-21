import { Injectable } from '@nestjs/common';
import { Setor } from 'src/modules/setores/types/setor';
import { SetorModel } from '../models/setor.model';
import { MissaoMapper } from './missao.mapper';
import { ModelMapper } from './model.mapper';

@Injectable()
export class SetorMapper extends ModelMapper<SetorModel, Setor> {
  constructor(private readonly _missaoMapper: MissaoMapper) {
    super();
  }

  map(model: SetorModel): Setor | null {
    if (!model) {
      return null;
    }
    return {
      id: +model.id,
      nome: model.nome,
      missao: this._missaoMapper.map(model.missao)!,
    };
  }
}

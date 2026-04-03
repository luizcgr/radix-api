import { Injectable } from '@nestjs/common';
import { Missao } from 'src/modules/missoes/types/missao';
import { MissaoModel } from '../models/missao.model';
import { ModelMapper } from './model.mapper';
import { RegionalMapper } from './regional.mapper';

@Injectable()
export class MissaoMapper extends ModelMapper<MissaoModel, Missao> {
  constructor(private readonly _regionalMapper: RegionalMapper) {
    super();
  }

  map(model: MissaoModel): Missao | null {
    if (!model) {
      return null;
    }
    return {
      id: +model.id,
      nome: model.nome,
      ativo: model.ativo,
      regional: this._regionalMapper.map(model.regional)!,
    };
  }
}

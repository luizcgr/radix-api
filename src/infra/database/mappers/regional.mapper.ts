import { Injectable } from '@nestjs/common';
import { Regional } from 'src/modules/regionais/types/regional';
import { RegionalModel } from '../models/regional.model';
import { ModelMapper } from './model.mapper';

@Injectable()
export class RegionalMapper extends ModelMapper<RegionalModel, Regional> {
  map(model: RegionalModel): Regional | null {
    if (!model) {
      return null;
    }
    return {
      id: +model.id,
      nome: model.nome,
      ativo: model.ativo,
    };
  }
}

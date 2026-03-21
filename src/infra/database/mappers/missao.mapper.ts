import { Injectable } from '@nestjs/common';
import { ModelMapper } from './model.mapper';
import { MissaoModel } from '../models/missao.model';
import { Missao } from 'src/modules/missoes/types/missao';

@Injectable()
export class MissaoMapper extends ModelMapper<MissaoModel, Missao> {
  map(model: MissaoModel): Missao | null {
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

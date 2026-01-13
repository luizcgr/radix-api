import { Injectable } from '@nestjs/common';
import { ModelAdapter } from './model.adapter';
import { MissaoModel } from '../models/missao.model';
import { Missao } from 'src/modules/missoes/types/missao';

@Injectable()
export class MissaoAdapter extends ModelAdapter<MissaoModel, Missao> {
  adapt(model: MissaoModel): Missao | null {
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

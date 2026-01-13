import { Injectable } from '@nestjs/common';
import { Setor } from 'src/modules/setores/types/setor';
import { SetorModel } from '../models/setor.model';
import { MissaoAdapter } from './missao.adapter';
import { ModelAdapter } from './model.adapter';

@Injectable()
export class SetorAdapter extends ModelAdapter<SetorModel, Setor> {
  constructor(private readonly _missaoAdapter: MissaoAdapter) {
    super();
  }

  adapt(model: SetorModel): Setor | null {
    if (!model) {
      return null;
    }
    return {
      id: +model.id,
      nome: model.nome,
      missao: this._missaoAdapter.adapt(model.missao)!,
    };
  }
}

import { Injectable } from '@nestjs/common';
import { Permissao } from 'src/modules/pessoas/types/permissao';
import { PermissaoModel } from '../models/permissao.model';
import { ModelAdapter } from './model.adapter';

@Injectable()
export class PermissaoAdapter extends ModelAdapter<PermissaoModel, Permissao> {
  adapt(model: PermissaoModel): Permissao | null {
    if (!model) {
      return null;
    }
    const permissao: Permissao = {
      id: +model.id,
      missao: model.missao,
      setor: model.setor,
      celula: model.celula,
    };
    return permissao;
  }
}

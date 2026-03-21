import { Injectable } from '@nestjs/common';
import { Permissao } from 'src/modules/pessoas/types/permissao';
import { PermissaoModel } from '../models/permissao.model';
import { ModelMapper } from './model.mapper';

@Injectable()
export class PermissaoMapper extends ModelMapper<PermissaoModel, Permissao> {
  map(model: PermissaoModel): Permissao | null {
    if (!model) {
      return null;
    }
    const permissao: Permissao = {
      id: +model.id,
      missao: model.missao,
      setor: model.setor,
      celula: model.celula,
      admin: model.admin,
    };
    return permissao;
  }
}

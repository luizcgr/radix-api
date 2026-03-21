import { Injectable } from '@nestjs/common';
import { Pessoa } from 'src/modules/pessoas/types/pessoa';
import { PessoaModel } from '../models/pessoa.model';
import { CelulaMapper } from './celula.mapper';
import { ModelMapper } from './model.mapper';
import { PermissaoMapper } from './permissao.mapper';

@Injectable()
export class PessoaMapper extends ModelMapper<PessoaModel, Pessoa> {
  constructor(
    private readonly _celulaMapper: CelulaMapper,
    private readonly _permissaoMapper: PermissaoMapper,
  ) {
    super();
  }

  map(model: PessoaModel): Pessoa | null {
    if (!model) {
      return null;
    }
    return {
      id: +model.id,
      nome: model.nome,
      cpf: model.cpf,
      email: model.email,
      celula: this._celulaMapper.map(model.celula)!,
      permissao: this._permissaoMapper.map(model.permissao)!,
    };
  }
}

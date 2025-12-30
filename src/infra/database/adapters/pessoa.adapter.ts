import { Injectable } from '@nestjs/common';
import { Pessoa } from 'src/modules/pessoas/types/pessoa';
import { PessoaModel } from '../models/pessoa.model';
import { CelulaAdapter } from './celula.adapter';
import { ModelAdapter } from './model.adapter';
import { PermissaoAdapter } from './permissao.adapter';

@Injectable()
export class PessoaAdapter extends ModelAdapter<PessoaModel, Pessoa> {
  constructor(
    private readonly _celulaAdapter: CelulaAdapter,
    private readonly _permissaoAdapter: PermissaoAdapter,
  ) {
    super();
  }

  adapt(model: PessoaModel): Pessoa | null {
    if (!model) {
      return null;
    }
    return {
      id: model.id,
      nome: model.nome,
      cpf: model.cpf,
      email: model.email,
      celula: this._celulaAdapter.adapt(model.celula)!,
      permissao: this._permissaoAdapter.adapt(model.permissao)!,
    };
  }
}

import { Provider } from '@nestjs/common';
import { CelulaAdapter } from './adapters/celula.adapter';
import { DevolucaoAdapter } from './adapters/devolucao.adapter';
import { MissaoAdapter } from './adapters/missao.adapter';
import { PessoaAdapter } from './adapters/pessoa.adapter';
import { SetorAdapter } from './adapters/setor.adapter';

export const adaptersProvider: Provider[] = [
  MissaoAdapter,
  SetorAdapter,
  CelulaAdapter,
  PessoaAdapter,
  DevolucaoAdapter,
];

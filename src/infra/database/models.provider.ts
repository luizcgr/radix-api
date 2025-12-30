import { ValueProvider } from '@nestjs/common';
import {
  CELULA_REPOSITORY,
  DEVOLUCAO_REPOSITORY,
  MISSAO_REPOSITORY,
  PERMISSAO_REPOSITORY,
  PESSOA_REPOSITORY,
  SETOR_REPOSITORY,
} from 'src/constants';
import { CelulaModel } from './models/celula.model';
import { DevolucaoModel } from './models/devolucao.model';
import { MissaoModel } from './models/missao.model';
import { PessoaModel } from './models/pessoa.model';
import { SetorModel } from './models/setor.model';

export const modelsProvider: ValueProvider[] = [
  {
    provide: MISSAO_REPOSITORY,
    useValue: MissaoModel,
  },
  {
    provide: SETOR_REPOSITORY,
    useValue: SetorModel,
  },
  {
    provide: CELULA_REPOSITORY,
    useValue: CelulaModel,
  },
  {
    provide: PESSOA_REPOSITORY,
    useValue: PessoaModel,
  },
  {
    provide: DEVOLUCAO_REPOSITORY,
    useValue: DevolucaoModel,
  },
  {
    provide: PERMISSAO_REPOSITORY,
    useValue: PessoaModel,
  },
];

import { Provider } from '@nestjs/common';
import { CelulaMapper } from './mappers/celula.mapper';
import { DevolucaoCelulaMapper } from './mappers/devolucao-celula.mapper';
import { DevolucaoMapper } from './mappers/devolucao.mapper';
import { MissaoMapper } from './mappers/missao.mapper';
import { PermissaoMapper } from './mappers/permissao.mapper';
import { PessoaMapper } from './mappers/pessoa.mapper';
import { RegionalMapper } from './mappers/regional.mapper';
import { SetorMapper } from './mappers/setor.mapper';

export const mappersProvider: Provider[] = [
  MissaoMapper,
  SetorMapper,
  CelulaMapper,
  PessoaMapper,
  DevolucaoMapper,
  PermissaoMapper,
  DevolucaoCelulaMapper,
  RegionalMapper,
];

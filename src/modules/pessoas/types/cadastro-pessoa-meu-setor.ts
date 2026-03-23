import { DadosBasicosPessoa } from './dados-basicos-pessoa';

export type CadastroPessoaMeuSetor = DadosBasicosPessoa & {
  id?: number;
  permissoes: {
    celula: boolean;
    setor: boolean;
  };
};

import { DadosBasicosCadastroPessoa } from './dados-basicos-cadastro-pessoa';

export type CadastroPessoaMeuSetor = DadosBasicosCadastroPessoa & {
  id?: number;
  permissoes: {
    celula: boolean;
    setor: boolean;
  };
};

import { DadosBasicosCadastroPessoa } from './dados-basicos-cadastro-pessoa';

export type CadastroPessoa = DadosBasicosCadastroPessoa & {
  permissoes: {
    missao: boolean;
    setor: boolean;
    celula: boolean;
    admin: boolean;
  };
};

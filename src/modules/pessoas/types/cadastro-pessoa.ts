import { DadosBasicosPessoa } from './dados-basicos-pessoa';

export type CadastroPessoa = DadosBasicosPessoa & {
  permissoes: {
    missao: boolean;
    setor: boolean;
    celula: boolean;
    admin: boolean;
  };
};

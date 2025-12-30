import { Celula } from 'src/modules/celulas/types/celula';
import { Permissao } from './permissao';

export type Pessoa = {
  id: number;
  nome: string;
  cpf: string;
  email: string;
  celula: Celula;
  permissao: Permissao;
};

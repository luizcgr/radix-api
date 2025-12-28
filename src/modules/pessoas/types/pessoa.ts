import { Celula } from 'src/modules/celulas/types/celula';

export type Pessoa = {
  id: number;
  nome: string;
  cpf: string;
  email: string;
  celula: Celula;
};

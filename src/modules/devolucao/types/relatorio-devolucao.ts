import { Devolucao } from './devolucao';

export type RelatorioDevolucao = {
  pessoa: {
    id: number;
    nome: string;
    celula: string;
    setor: string;
    missao: string;
  };
  devolucoes: Devolucao[];
};

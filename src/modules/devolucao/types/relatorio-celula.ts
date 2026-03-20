import { ItemEvolucao } from './item-evolucao';

export type DadosBasicosRelatorio = {
  anoReferencia: number;
  mesReferencia: number;
  celula: string;
  setor: string;
  missao: string;
  totalDevolucoes: number;
  totalPessoas: number;
  fidelidade: number;
  pessoas: { id: number; nome: string; devolucao: boolean }[];
};

export type RelatorioCelula = DadosBasicosRelatorio & {
  evolucao: {
    quantidades: ItemEvolucao[];
    valores: ItemEvolucao[];
  };
};

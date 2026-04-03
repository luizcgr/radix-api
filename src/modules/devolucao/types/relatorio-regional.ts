import { ItemEvolucao } from './item-evolucao';

export type DadosBasicosRelatorioRegional = {
  id: number;
  nome: string;
  mesReferencia: number;
  anoReferencia: number;
  totalPessoas: number;
  totalDevolucoes: number;
  fidelidade: number;
  missoes: {
    id: number;
    nome: string;
    totalSetores: number;
    totalCelulas: number;
    totalPessoas: number;
    totalDevolucoes: number;
    fidelidade: number;
  }[];
};

export type RelatorioRegional = DadosBasicosRelatorioRegional & {
  evolucao: {
    quantidades: ItemEvolucao[];
    valores: ItemEvolucao[];
  };
};

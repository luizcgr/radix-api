import { ItemEvolucao } from './item-evolucao';

export type DadosBasicosRelatorioMissao = {
  id: number;
  nome: string;
  mesReferencia: number;
  anoReferencia: number;
  totalPessoas: number;
  totalDevolucoes: number;
  fidelidade: number;
  setores: {
    id: number;
    nome: string;
    totalCelulas: number;
    totalPessoas: number;
    totalDevolucoes: number;
    fidelidade: number;
  }[];
};

export type RelatorioMissao = DadosBasicosRelatorioMissao & {
  evolucao: {
    quantidades: ItemEvolucao[];
    valores: ItemEvolucao[];
  };
};

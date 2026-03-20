import { ItemEvolucao } from './item-evolucao';

export type DadosBasicosRelatorioSetor = {
  id: number;
  nome: string;
  missao: string;
  mesReferencia: number;
  anoReferencia: number;
  totalPessoas: number;
  totalDevolucoes: number;
  fidelidade: number;
  celulas: {
    id: number;
    nome: string;
    totalPessoas: number;
    totalDevolucoes: number;
    fidelidade: number;
  }[];
};

export type RelatorioSetor = DadosBasicosRelatorioSetor & {
  evolucao: {
    quantidades: ItemEvolucao[];
    valores: ItemEvolucao[];
  };
};

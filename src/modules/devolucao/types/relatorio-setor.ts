export type RelatorioSetor = {
  id: number;
  nome: string;
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

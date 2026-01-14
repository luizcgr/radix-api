export type RelatorioMissao = {
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

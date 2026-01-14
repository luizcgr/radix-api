export type RelatorioCelula = {
  celula: string;
  setor: string;
  missao: string;
  anoReferencia: number;
  mesReferencia: number;
  totalDevolucoes: number;
  totalPessoas: number;
  fidelidade: number;
  pessoas: {
    id: number;
    nome: string;
    devolucao: boolean;
  }[];
};

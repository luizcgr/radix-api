export type PessoaRelatorioCelula = {
  id: number;
  nome: string;
  devolucao: boolean;
};

export type RelatorioCelula = {
  celula: string;
  setor: string;
  missao: string;
  anoReferencia: number;
  mesReferencia: number;
  totalDevolucoes: number;
  totalPessoas: number;
  fidelidade: number;
  pessoas: PessoaRelatorioCelula[];
};

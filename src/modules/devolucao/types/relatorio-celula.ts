export type PessoaRelatorioCelula = {
  nome: string;
  devolucao: boolean;
};

export type RelatorioCelula = {
  nome: string;
  anoReferencia: number;
  mesReferencia: number;
  totalDevolucoes: number;
  totalPessoas: number;
  fidelidade: number;
  pessoas: PessoaRelatorioCelula[];
};

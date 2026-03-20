export type ParametrosRelatorioEvolucao = {
  mesReferencia: number;
  anoReferencia: number;
} & ({ celulaId: number } | { setorId: number } | { missaoId: number });

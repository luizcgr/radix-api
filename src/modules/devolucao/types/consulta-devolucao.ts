import { StatusDevolucao } from './status-devolucao';

export type ConsultaDevolucao = {
  pessoaId: number;
  anoReferencia: number;
  mesReferencia?: number;
  status?: StatusDevolucao;
  celulaId?: number;
  setorId?: number;
  missaoId?: number;
};

import { StatusDevolucao } from './status-devolucao';

export type DevolucaoCelula = {
  id: number;
  status: StatusDevolucao;
  mesReferencia: number;
  anoReferencia: number;
};

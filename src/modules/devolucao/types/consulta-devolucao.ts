import { StatusDevolucao } from './status-devolucao';

export type ConsultaDevolucao =
  | { id: number }
  | {
      pessoaId: number;
      anoReferencia: number;
      mesReferencia?: number;
      status?: StatusDevolucao;
    };

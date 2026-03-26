import { Pessoa } from 'src/modules/pessoas/types/pessoa';
import { StatusDevolucao } from './status-devolucao';

export type Devolucao = {
  id: number;
  status: StatusDevolucao;
  dataCriacao: Date;
  dataPagamento?: Date;
  mesReferencia: number;
  anoReferencia: number;
  valorDizimo: number;
  valorFundoComunhao: number;
  pessoa: Pessoa;
  solicitante: Pessoa;
  pagamentoId: string;
  urlPagamento: string;
  numeroPagamento: string;
  codigoCliente: string;
  dataEmailConfirmacao?: Date;
};

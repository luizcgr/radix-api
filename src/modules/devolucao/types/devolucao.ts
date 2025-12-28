import { Pessoa } from 'src/modules/pessoas/types/pessoa';
import { StatusDevolucao } from './status-devolucao';

export type Devolucao = {
  id: number;
  status: StatusDevolucao;
  data: Date;
  mesReferencia: number;
  anoReferencia: number;
  valorTotal: number;
  pessoa: Pessoa;
  assasPaymentId: string;
  asaasPaymentInvoiceUrl: string;
  asaasPaymentInvoiceNumber: string;
  asaasPaymentCustomer: string;
};

import { FormaPagamento } from 'src/modules/cobranca/types/forma-pagamento';

export type SolicitacaoDevolucao = {
  valorDizimo: number;
  valorFundoComunhao: number;
  mesReferencia: number;
  anoReferencia: number;
  pessoaId: number;
  formaPagamento: FormaPagamento;
};

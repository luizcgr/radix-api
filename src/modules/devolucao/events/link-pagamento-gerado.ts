import { FormaPagamento } from 'src/modules/cobranca/types/forma-pagamento';

export type EventoEnvioLinkPagamento = {
  email: string;
  nome: string;
  link: string;
  anoReferencia: number;
  mesReferencia: number;
  valorComunhaoBens: number;
  valorFundoComunhao: number;
  formaPagamento: FormaPagamento;
  setor: string;
};

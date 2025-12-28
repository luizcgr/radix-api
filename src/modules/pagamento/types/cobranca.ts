import { FormaPagamento } from './forma-pagamento';

export type Cobranca = {
  nome: string;
  cpf: string;
  valor: number;
  formaPagamento: FormaPagamento;
};

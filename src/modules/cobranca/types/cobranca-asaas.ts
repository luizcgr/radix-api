import { FormaPagamento } from './forma-pagamento';

export type CobrancaAsaas = {
  nome: string;
  cpf: string;
  valor: number;
  formaPagamento: FormaPagamento;
};

import { IsIn, IsNotEmpty, IsNumber } from 'class-validator';
import type { FormaPagamento } from 'src/modules/cobranca/types/forma-pagamento';

export class SolicitacaoDevolucaoDto {
  @IsNotEmpty({ message: 'Informe o valor da devolução' })
  @IsNumber(undefined, { message: 'O valor deve ser numérico' })
  valor: number;
  @IsNotEmpty({ message: 'Informe o mês de referência' })
  @IsNumber(undefined, { message: 'O valor deve ser numérico' })
  mesReferencia: number;
  @IsNotEmpty({ message: 'Informe o ano de referência' })
  @IsNumber(undefined, { message: 'O valor deve ser numérico' })
  anoReferencia: number;
  @IsNotEmpty({ message: 'Informe o id da pessoa' })
  @IsNumber(undefined, { message: 'O valor deve ser numérico' })
  pessoaId: number;
  @IsNotEmpty({ message: 'Informe a forma de pagamento' })
  @IsIn(['cartao_credito', 'pix'])
  formaPagamento: FormaPagamento;
}

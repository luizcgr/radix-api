import { IsIn, IsNotEmpty, IsNumber, Max, Min } from 'class-validator';
import type { FormaPagamento } from 'src/modules/cobranca/types/forma-pagamento';

export class SolicitacaoDevolucaoPessoalDto {
  @IsNotEmpty({ message: 'Informe o valor da devolução' })
  @IsNumber(undefined, { message: 'O valor da devolução deve ser numérico' })
  valorDizimo: number;
  @IsNotEmpty({ message: 'Informe o valor do fundo de comunhão' })
  @IsNumber(undefined, {
    message: 'O valor do fundo de comunhão deve ser numérico',
  })
  valorFundoComunhao: number;
  @IsNotEmpty({ message: 'Informe o mês de referência' })
  @Min(1, { message: 'O mês de referência deve ser entre 1 e 12' })
  @Max(12, { message: 'O mês de referência deve ser entre 1 e 12' })
  @IsNumber(undefined, { message: 'O mês de referência deve ser numérico' })
  mesReferencia: number;
  @IsNotEmpty({ message: 'Informe o ano de referência' })
  @IsNumber(undefined, { message: 'O valor deve ser numérico' })
  anoReferencia: number;
  @IsNotEmpty({ message: 'Informe a forma de pagamento' })
  @IsIn(['cartao_credito', 'pix'])
  formaPagamento: FormaPagamento;
}

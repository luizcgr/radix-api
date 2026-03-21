import { IsNumber, IsOptional, IsString } from 'class-validator';
import { AtLeastOneField } from '../../utils/validators/at-least-one-field.validator';
import { Type } from 'class-transformer';

@AtLeastOneField(['cpf', 'celulaId', 'nome'])
export class ConsultaPessoasMeuSetorDto {
  @IsOptional()
  @IsString({ message: 'O CPF deve ser uma string' })
  cpf?: string;
  @IsOptional()
  @IsString({ message: 'O nome deve ser uma string' })
  nome?: string;
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'O id da célula deve ser um número' })
  celulaId?: number;
}

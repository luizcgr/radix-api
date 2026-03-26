import { Type } from 'class-transformer';
import { IsEmail, IsNotEmpty, ValidateNested } from 'class-validator';
import { PermissaoPessoaMeuSetorDto } from './permissao-pessoa-meu-setor.dto';
import { IsCpf } from '../../utils/validators/cpf.validator';

export class CadastroPessoaMeuSetorDto {
  @IsNotEmpty({ message: 'O nome é obrigatório' })
  nome: string;
  @IsNotEmpty({ message: 'O CPF é obrigatório' })
  @IsCpf({ message: 'O CPF deve conter 11 dígitos numéricos e ser válido' })
  cpf: string;
  @IsNotEmpty({ message: 'O email é obrigatório' })
  @IsEmail({}, { message: 'O email informado não é válido' })
  email: string;
  @IsNotEmpty({ message: 'O ID da célula é obrigatório' })
  celulaId: number;
  @IsNotEmpty({ message: 'As permissões são obrigatórias' })
  @ValidateNested()
  @Type(() => PermissaoPessoaMeuSetorDto)
  permissoes: PermissaoPessoaMeuSetorDto;
}

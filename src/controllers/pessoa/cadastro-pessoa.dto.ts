import { IsEmail, IsNotEmpty, IsNumber } from 'class-validator';
import { PermissaoDto } from './permissao.dto';
import { Type } from 'class-transformer';

export class CadastroPessoaDto {
  @IsNotEmpty({ message: 'O nome é obrigatório' })
  nome: string;
  @IsNotEmpty({ message: 'O CPF é obrigatório' })
  cpf: string;
  @IsNotEmpty({ message: 'O email é obrigatório' })
  @IsEmail()
  email: string;
  @IsNotEmpty({ message: 'O ID da célula é obrigatório' })
  @IsNumber({}, { message: 'O ID da célula deve ser um número' })
  celulaId: number;
  @IsNotEmpty({ message: 'As permissões são obrigatórias' })
  @Type(() => PermissaoDto)
  permissoes: PermissaoDto;
}

import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginEmailSenhaDto {
  @IsNotEmpty({ message: 'O email não pode ser vazio' })
  @IsEmail({}, { message: 'O email deve ser válido' })
  email: string;
  @IsNotEmpty({ message: 'A senha não pode ser vazia' })
  @IsString({ message: 'Senha inválida' })
  senha: string;
}

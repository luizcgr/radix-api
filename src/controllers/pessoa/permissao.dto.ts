import { IsBoolean, IsNotEmpty } from 'class-validator';

export class PermissaoDto {
  @IsNotEmpty({ message: 'A permissão de missão é obrigatória' })
  @IsBoolean({ message: 'A permissão de missão deve ser um valor booleano' })
  missao: boolean;
  @IsNotEmpty({ message: 'A permissão de setor é obrigatória' })
  @IsBoolean({ message: 'A permissão de setor deve ser um valor booleano' })
  setor: boolean;
  @IsNotEmpty({ message: 'A permissão de célula é obrigatória' })
  @IsBoolean({ message: 'A permissão de célula deve ser um valor booleano' })
  celula: boolean;
  @IsNotEmpty({ message: 'A permissão de admin é obrigatória' })
  @IsBoolean({ message: 'A permissão de admin deve ser um valor booleano' })
  admin: boolean;
}

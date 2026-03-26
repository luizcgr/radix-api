import { IsNotEmpty } from 'class-validator';

export class CadastroCelulaMeuSetorDto {
  @IsNotEmpty()
  nome: string;
}

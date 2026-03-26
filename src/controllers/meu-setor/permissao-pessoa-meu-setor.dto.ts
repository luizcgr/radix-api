import { Type } from 'class-transformer';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class PermissaoPessoaMeuSetorDto {
  @IsNotEmpty()
  @IsBoolean()
  @Type(() => Boolean)
  celula: boolean;
  @IsNotEmpty()
  @IsBoolean()
  @Type(() => Boolean)
  setor: boolean;
}
